import { zipObject, unzip } from 'lodash';
import { makeMessage } from '../../message';
import { UntypedExpression } from '../../untyped-expression';
import { assertNever } from '../../utils';
import {
  ApplicationExpression,
  BooleanExpression,
  Expression,
  ExpressionKind,
  FloatExpression,
  IdentifierExpression,
  IntegerExpression,
  LambdaExpression,
  ListExpression,
  NothingExpression,
  StringExpression,
} from '../expression';
import { createChildScope, findVariableTypeInScope, TypeScope } from '../scope';
import { pMap } from '../utils';
import { LazyValue, ValueKind } from '../value';
import {
  anything,
  booleanType,
  floatType, functionLiteralType, functionType,
  integerType,
  lazyValue,
  listType,
  nothing,
  stringType, unboundVariable,
} from '../value-constructors';
import { sequenceConverges, fullConverge } from './full-converge';
import { makeInferredFunctionType } from './make-inferred-function-type';
import { resolveImplicits } from './resolve-implicits';
import { State, StateResult } from './state';
import { Type, type } from './type';
import { freeBoundVariable } from './utils';
import {
  applyAllSubstitutions,
  applyReplacementsToType,
} from './variable-substitutions';

async function isCallable(value: LazyValue): Promise<boolean> {
  const strictValue = await value();
  if (strictValue.kind !== ValueKind.Application) {
    return false;
  }

  const strictCallee = await strictValue.callee();
  return strictCallee.kind === ValueKind.UserDefinedLiteral
    && strictCallee.name === functionLiteralType.name;
}

async function extractParameterTypes(value: LazyValue, previous: LazyValue[] = []): Promise<[LazyValue[], LazyValue]> {
  const strictValue = await value();
  if (strictValue.kind !== ValueKind.Application) {
    return [previous, value];
  }

  const callee = await strictValue.callee();
  if (callee.kind !== ValueKind.UserDefinedLiteral || callee.name !== functionLiteralType.name) {
    return [previous, value];
  }

  const [left, right] = await Promise.all(Array.from(
    strictValue.parameters(),
    parameter => parameter(),
  ));

  if (!right) {
    return [previous, lazyValue(left)];
  }

  return extractParameterTypes(lazyValue(right), [...previous, lazyValue(left)]);
}

function expressionResult(
  resultType: Type,
  expression: Expression,
): TypeExpressionResult {
  return [resultType, (implicits) => {
    return implicits.length > 0
      ? {
        resultType: type(lazyValue(nothing)),
        kind: ExpressionKind.Application,
        tokens: expression.tokens,
        implicitParameters: [],
        parameters: implicits,
        callee: expression,
      }
      : expression;
  }];
}

function convertImplicitToExpression(implicits: Expression[]) {
  return (reference: string | number): Expression => {
    switch (typeof reference) {
      case 'number':
        return implicits[reference];

      case 'string':
        return {
          kind: ExpressionKind.Identifier,
          // TODO correctly type the implicit
          resultType: type(lazyValue(anything)),
          tokens: [],
          name: reference,
        }
    }
  };
}

export type TypeExpressionResult = [Type, (implicitParameters: Expression[]) => Expression];

export async function typeExpression(
  scope: TypeScope,
  expression: UntypedExpression,
): Promise<StateResult<TypeExpressionResult>> {
  const state = State.of(scope);
  switch (expression.kind) {
    case 'Boolean': {
      const resultType = type(lazyValue(booleanType));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Boolean,
        tokens: expression.tokens,
        value: expression.value,
      }));
    }

    case 'String': {
      const resultType = type(lazyValue(stringType));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.String,
        tokens: expression.tokens,
        value: expression.value,
      }));
    }

    case 'Float': {
      const resultType = type(lazyValue(floatType));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Float,
        tokens: expression.tokens,
        value: expression.value,
      }));
    }

    case 'Integer': {
      const resultType = type(lazyValue(integerType));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Integer,
        tokens: expression.tokens,
        value: expression.value,
      }));
    }

    case 'None': {
      const resultType = type(lazyValue(nothing));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Nothing,
        tokens: expression.tokens,
      }));
    }

    case 'Identifier': {
      const variable = findVariableTypeInScope(state.scope(), expression.value);
      const resultType = variable || type(lazyValue(nothing));
      return state.wrap(expressionResult(resultType, {
        resultType,
        kind: ExpressionKind.Identifier,
        tokens: expression.tokens,
        name: expression.value,
      }));
    }

    case 'Array': {
      const { elements, tokens } = expression;
      const [elementTypes, typedElements] = unzip(
        await pMap(elements, state.runAsyncP1(typeExpression))
      ) as [Type[], ((i: Expression[]) => Expression)[]];

      const blankVariable = lazyValue(unboundVariable('T'));
      // TODO ensure each of the element resultTypes belong to the same context
      const converges = elementTypes.map(({ value }) => fullConverge(blankVariable, value));
      const { left, right, inferred } = await state.runAsync(sequenceConverges, converges);

      // TODO
      const converged = true;
      if (!converged) {
        state.log(makeMessage(
          'Error',
          'Array element does not match element type',
          tokens[0],
          tokens[tokens.length - 1],
        ));
      }

      // Resolve any implicit parameters
      const resolvedElementTypes = elementTypes.map(type => (
        applyReplacementsToType(right, inferred, type)
      ));
      const { missing, carried } = await state.runAsync(resolveImplicits, resolvedElementTypes);

      const result = applyAllSubstitutions(left, inferred, blankVariable);
      const resultType = type(lazyValue(converged ? listType(result) : nothing), missing);
      const continuation = (implicits: Expression[]): Expression => {
        const convertImplicit = convertImplicitToExpression(implicits);
        return ({
          tokens,
          resultType,
          kind: ExpressionKind.List,
          elements: typedElements.map((element, index) => (
            element(carried[index].map(convertImplicit))
          )),
        });
      };
      return state.wrapWithSubstitutions<TypeExpressionResult>(inferred, [resultType, continuation]);
    }

    case 'Function': {
      // Create an bound variable for each of the parameters
      const argumentNames = expression.arguments.map(argument => argument.value);
      const parameterVariables = expression.arguments.map(argument => (
        freeBoundVariable(state.scope(), `${argument.value}T`)
      ));

      // Extend the scope with the new parameter types
      const childScope = createChildScope(state.scope(), {
        variables: zipObject(argumentNames, parameterVariables.map(value => ({
          valueType: type(lazyValue(value)),
        }))),
      });
      const childState = State.of(childScope);

      // Type the function body which will attempt to infer the parameter types and update the scope
      const [bodyType, typedBody] = await childState.runAsync(typeExpression, expression.value);

      // Determine the type of the whole function
      // TODO this is bugged because it assumes that every parameter's type is in the same scope
      const inferredFunctionType = await childState.runAsync(
        makeInferredFunctionType,
        bodyType,
        argumentNames,
      );

      return state.wrap<TypeExpressionResult>([inferredFunctionType, (implicits): LambdaExpression => ({
        kind: ExpressionKind.Lambda,
        parameterNames: argumentNames,
        // TODO this is probably a bug because we don't do anything with the implicits
        body: typedBody(implicits),
        resultType: inferredFunctionType,
        tokens: expression.tokens,
      })]);
    }

    case 'FunctionCall': {
      // Type the callee expression
      const [calleeType, typedCallee] = await state.runAsync(typeExpression, expression.functionExpression);

      // Type each of the arguments
      const [parameterTypes, typedParameters] = unzip(
        await pMap(expression.args, state.runAsyncP1(typeExpression))
      ) as [Type[], ((i: Expression[]) => Expression)[]];

      // Check if the callee is callable
      const calleeTypeValue = calleeType.value;
      if (!await isCallable(calleeTypeValue)) {
        state.log(makeMessage(
          'Error',
          'Cannot call that expression',
          expression.tokens[0],
          expression.tokens[expression.tokens.length - 1],
        ));
        const resultType = type(lazyValue(nothing));
        return state.wrap<TypeExpressionResult>([resultType, (): ApplicationExpression => ({
          resultType,
          kind: ExpressionKind.Application,
          tokens: expression.tokens,
          parameters: typedParameters.map(parameter => parameter([])),
          callee: typedCallee([]),
        })]);
      }

      // Check if too many parameters were supplied
      const [acceptedParameters, expectedResult] = await extractParameterTypes(calleeTypeValue);
      if (typedParameters.length > acceptedParameters.length) {
        state.log(makeMessage(
          'Error',
          `Too many parameters. Expected ${acceptedParameters.length}, received ${typedParameters.length}`,
          expression.tokens[0],
          expression.tokens[expression.tokens.length - 1],
        ));
      }

      // TODO handle partial application
      // Converge all parameters with their expected type
      const expectedParameters = acceptedParameters.slice(0, typedParameters.length);
      const converges = parameterTypes.map((parameterTypes, index) => (
        fullConverge(expectedParameters[index], parameterTypes.value)
      ));
      const { left, right, inferred } = await state.runAsync(sequenceConverges, converges);

      // TODO
      // Throw an error message if the result failed to be converged
      const successful = true;
      if (!successful) {
        state.log(makeMessage(
          'Error',
          'One of the parameters failed to converge',
          expression.tokens[0],
          expression.tokens[expression.tokens.length - 1],
        ));
        const resultType = type(lazyValue(nothing));
        return state.wrap<TypeExpressionResult>([resultType, (): ApplicationExpression => ({
          resultType,
          kind: ExpressionKind.Application,
          tokens: expression.tokens,
          parameters: typedParameters.map(parameter => parameter([])),
          callee: typedCallee([]),
        })]);
      }

      // Find any implicits
      const callee = applyReplacementsToType(
        left,
        inferred,
        calleeType,
      );
      const parameters = parameterTypes.map(parameterType => applyReplacementsToType(
        right,
        inferred,
        parameterType,
      ));

      const types = [
        callee,
        ...parameters,
      ];
      const { missing, carried: [carriedCalleeImplicits, ...carriedImplicits] } = (
        await state.runAsync(resolveImplicits, types)
      );

      // Find the result type of the function
      // TODO I don't think implicits are applied to the return value which might cause bugs
      //      with return type polymorphism
      const substitutedResult = applyAllSubstitutions(left, inferred, expectedResult);
      const resultType = !successful
        ? type(lazyValue(nothing))
        : type(
          acceptedParameters.length === typedParameters.length
            ? substitutedResult
            : functionType(
                ...acceptedParameters.slice(typedParameters.length).map(parameter => (
                  applyAllSubstitutions(left, inferred, parameter)
                )),
                substitutedResult,
              ),
          missing,
        );

      return state.wrapWithSubstitutions<TypeExpressionResult>(inferred, [resultType, (implicits): ApplicationExpression => {
        const convertImplicit = convertImplicitToExpression(implicits);
        return ({
          resultType,
          kind: ExpressionKind.Application,
          tokens: expression.tokens,
          parameters: typedParameters.map((typedParameter, index) => (
            typedParameter(carriedImplicits[index].map(convertImplicit))
          )),
          callee: typedCallee(carriedCalleeImplicits.map(convertImplicit)),
        });
      }]);
    }

    case 'Unrecognized':
      // TODO handle errors better
      throw new Error('Cannot type unrecognized expression');

    default:
      return assertNever(expression);
  }
}
