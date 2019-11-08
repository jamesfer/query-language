import { zipObject } from 'lodash';
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


export async function typeExpression(scope: TypeScope, expression: UntypedExpression): Promise<StateResult<Expression>> {
  const state = State.of(scope);
  switch (expression.kind) {
    case 'Boolean':
      return state.wrap<BooleanExpression>({
        kind: ExpressionKind.Boolean,
        resultType: type(lazyValue(booleanType)),
        tokens: expression.tokens,
        value: expression.value,
        implicitParameters: [],
      });

    case 'String':
      return state.wrap<StringExpression>({
        kind: ExpressionKind.String,
        resultType: type(lazyValue(stringType)),
        tokens: expression.tokens,
        value: expression.value,
        implicitParameters: [],
      });

    case 'Float':
      return state.wrap<FloatExpression>({
        kind: ExpressionKind.Float,
        resultType: type(lazyValue(floatType)),
        tokens: expression.tokens,
        value: expression.value,
        implicitParameters: [],
      });

    case 'Integer':
      return state.wrap<IntegerExpression>({
        kind: ExpressionKind.Integer,
        resultType: type(lazyValue(integerType)),
        tokens: expression.tokens,
        value: expression.value,
        implicitParameters: [],
      });

    case 'None':
      return state.wrap<NothingExpression>({
        kind: ExpressionKind.Nothing,
        resultType: type(lazyValue(nothing)),
        tokens: expression.tokens,
        implicitParameters: [],
      });

    case 'Identifier': {
      const variable = findVariableTypeInScope(state.scope(), expression.value);
      return state.wrap<IdentifierExpression>({
        kind: ExpressionKind.Identifier,
        resultType: variable || type(lazyValue(nothing)),
        tokens: expression.tokens,
        name: expression.value,
        implicitParameters: [],
      });
    }

    case 'Array': {
      const { elements, tokens } = expression;
      const typedElements = await pMap(elements, state.runAsyncP1(typeExpression));
      const blankVariable = lazyValue(unboundVariable('T'));
      const converges = [
        // TODO ensure each of the element resultTypes belong to the same context
        ...typedElements.map(element => fullConverge(blankVariable, element.resultType.value)),
      ];
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
      const elementTypes: Type[] = typedElements.map(typedElement => (
        applyReplacementsToType(right, inferred, typedElement.resultType)
      ));
      const { missing, carried } = await state.runAsync(resolveImplicits, elementTypes);

      const result = applyAllSubstitutions(left, inferred, blankVariable);
      return state.wrapWithSubstitutions<ListExpression>(inferred, {
        tokens,
        kind: ExpressionKind.List,
        resultType: type(lazyValue(converged ? listType(result) : nothing), missing),
        elements: typedElements.map((element, index) => ({
          ...element,
          implicitParameters: carried[index],
        })),
        implicitParameters: [],
      });
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
      const typedBody = await childState.runAsync(typeExpression, expression.value);

      // Determine the type of the whole function
      // TODO this is bugged because it assumes that every parameter's type is in the same scope
      const inferredFunctionType = await childState.runAsync(
        makeInferredFunctionType,
        typedBody.resultType,
        argumentNames,
      );

      return state.wrap<LambdaExpression>({
        kind: ExpressionKind.Lambda,
        parameterNames: argumentNames,
        body: typedBody,
        resultType: inferredFunctionType,
        tokens: expression.tokens,
        implicitParameters: [],
      });
    }

    case 'FunctionCall': {
      // Type the callee expression
      const typedCallee = await state.runAsync(typeExpression, expression.functionExpression);

      // Type each of the arguments
      const typedParameters = await pMap(expression.args, state.runAsyncP1(typeExpression));

      // Check if the callee is callable
      const calleeTypeValue = typedCallee.resultType.value;
      if (!await isCallable(calleeTypeValue)) {
        state.log(makeMessage(
          'Error',
          'Cannot call that expression',
          expression.tokens[0],
          expression.tokens[expression.tokens.length - 1],
        ));
        return state.wrap<ApplicationExpression>({
          resultType: type(lazyValue(nothing)),
          kind: ExpressionKind.Application,
          tokens: expression.tokens,
          implicitParameters: [],
          parameters: typedParameters,
          callee: typedCallee,
        });
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
      const converges = typedParameters.map((typedParameter, index) => (
        fullConverge(expectedParameters[index], typedParameter.resultType.value)
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
        return state.wrap<ApplicationExpression>({
          resultType: type(lazyValue(nothing)),
          kind: ExpressionKind.Application,
          tokens: expression.tokens,
          implicitParameters: [],
          parameters: typedParameters,
          callee: typedCallee,
        });
      }

      // Find any implicits
      const callee = applyReplacementsToType(
        left,
        inferred,
        typedCallee.resultType,
      );
      const parameters = typedParameters.map(typedParameter => applyReplacementsToType(
        right,
        inferred,
        typedParameter.resultType,
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

      return state.wrapWithSubstitutions<ApplicationExpression>(inferred, {
        resultType,
        kind: ExpressionKind.Application,
        implicitParameters: [],
        tokens: expression.tokens,
        parameters: typedParameters.map((element, index) => ({
          ...element,
          implicitParameters: carriedImplicits[index],
        })),
        callee: {
          ...typedCallee,
          implicitParameters: carriedCalleeImplicits,
        },
      });
    }

    case 'Unrecognized':
      // TODO handle errors better
      throw new Error('Cannot type unrecognized expression');

    default:
      return assertNever(expression);
  }
}
