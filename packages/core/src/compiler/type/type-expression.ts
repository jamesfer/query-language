import { compact, flatMap, zipObject } from 'lodash';
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
import { pMap, pMapWithIndex } from '../utils';
import { LazyValue, ValueKind } from '../value';
import {
  booleanType,
  floatType, functionLiteralType, functionType,
  integerType,
  lazyValue,
  listType,
  nothing,
  stringType,
} from '../value-constructors';
import { convergeManyTypes, ConvergeManyTypesResult, convergeTypes } from './converge-types';
import { findImplicits } from './find-implicits';
import { makeInferredFunctionType } from './make-inferred-function-type';
import { State, StateResult } from './state';
import { serializeValue } from './test-utils';
import { type } from './type';
import { freeBoundVariable } from './utils';
import {
  applyInferredSubstitutions, applyReplacementsToType,
  applySubstitutions,
  VariableSubstitution,
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

      // Type each of the elements
      const typedElements = await pMap(elements, state.runAsyncP1(typeExpression));
      const elementTypes = typedElements.map(element => element.resultType.value);

      // Converge all of the types into one if possible
      const [inferredSubstitutions, substitutions, converged] = await state.runAsync(
        convergeManyTypes,
        elementTypes,
      );

      if (!converged) {
        state.log(makeMessage(
          'Error',
          'Array element does not match element type',
          tokens[0],
          tokens[tokens.length - 1],
        ));
      }

      // Check if we can imply any interfaces for each of the elements
      const implicits = converged
        ? await pMap(
          typedElements.map(({ resultType }) => resultType).map((type, index) => ({
            ...type,
            // TODO should also apply inferred substitutions to this type
            value: applySubstitutions(substitutions[index], type.value),
          })),
          state.runAsyncP1(findImplicits),
        )
        : [];

      // Collect all the implicits that we couldn't find
      const missingImplicits = flatMap(implicits, (implicitList, elementIndex) => (
        compact(implicitList.map((implicitArg, implicitIndex) => (
          implicitArg === undefined
            ? typedElements[elementIndex].resultType.constraints[implicitIndex]
            : undefined
        )))
      ));

      // Replace any implicits we couldn't find with the index from the parent
      let index = 0;
      const carriedImplicits = implicits.map(elementImplicits => elementImplicits.map(implicit => (
        implicit === undefined ? index++ : implicit
      )));

      return state.wrapWithSubstitutions<ListExpression>(inferredSubstitutions, {
        tokens,
        kind: ExpressionKind.List,
        resultType: type(lazyValue(converged ? listType(converged) : nothing), missingImplicits),
        elements: typedElements.map((element, index) => ({
          ...element,
          implicitParameters: carriedImplicits[index],
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

      const [expectedParameters, expectedResult] = await extractParameterTypes(calleeTypeValue);
      const inferredSubstitutions: VariableSubstitution[] = [];
      const calleeSubstitutions: VariableSubstitution[] = [];
      const elementResults = await pMapWithIndex(typedParameters.slice(0, expectedParameters.length), async (parameter, index): Promise<[{ left: VariableSubstitution[], right: VariableSubstitution[] }, LazyValue | undefined]> => {
        // Converge the current parameter with the expected parameter
        const [{ inferred, ...substitutions }, converged] = await state.runAsync(
          convergeTypes,
          applyInferredSubstitutions(
            inferredSubstitutions,
            applySubstitutions(calleeSubstitutions, expectedParameters[index]),
          ),
          applyInferredSubstitutions(inferredSubstitutions, parameter.resultType.value),
        );

        // Update the callee's and inferred substitutions
        inferredSubstitutions.push(...inferred);
        calleeSubstitutions.push(...substitutions.left);

        return [substitutions, converged];
      });

      const convergedParameters = elementResults.map(([, parameter]) => parameter);
      const successful = convergedParameters.every(result => result !== undefined);
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

      // Combine all replacements together for each element
      const leftSubstitutions = elementResults.map(([{ left }]) => left);
      const parameterSubstitutions = elementResults.map(([{ right }], index) => (
        right.concat(...leftSubstitutions.slice(index))
      ));

      // Check if we can imply any interfaces for each of the elements
      const implicits = await pMap(
        typedParameters.map(({ resultType }, index) => (
          applyReplacementsToType(parameterSubstitutions[index], inferredSubstitutions, resultType)
        )),
        state.runAsyncP1(findImplicits),
      );

      // Check if we can imply any interfaces for the callee
      const calleeImplicits = await state.runAsync(
        findImplicits,
        applyReplacementsToType(calleeSubstitutions, inferredSubstitutions, typedCallee.resultType),
      );

      // Collect all the implicits that we couldn't find
      const missingImplicits = flatMap(
        [calleeImplicits, ...implicits],
        (implicitList, elementIndex) => compact(implicitList.map((implicitArg, implicitIndex) => (
          implicitArg === undefined
            ? [typedCallee, ...typedParameters][elementIndex].resultType.constraints[implicitIndex]
            : undefined
        )))
      );

      // Replace any implicits we couldn't find with the index from the parent
      let index = 0;
      const [carriedCalleeImplicits, ...carriedImplicits] = [calleeImplicits, ...implicits].map(
        elementImplicits => elementImplicits.map(implicit => (
          implicit === undefined ? index++ : implicit
        ))
      );


      // TODO throw error if too many parameters are given

      // Find the result type of the function
      // TODO I don't think implicits aren't applied to the return value which might cause bugs
      //      with return type polymorphism
      const substitutedResult = applySubstitutions(calleeSubstitutions, applyInferredSubstitutions(inferredSubstitutions, expectedResult));
      const resultType = !successful
        ? type(lazyValue(nothing))
        : expectedParameters.length === typedParameters.length
          ? type(substitutedResult, missingImplicits)
          : type(
            functionType(
              ...expectedParameters.slice(typedParameters.length).map(parameter => applySubstitutions(calleeSubstitutions, applyInferredSubstitutions(inferredSubstitutions, parameter))),
              substitutedResult,
            ),
            missingImplicits,
          );

      return state.wrapWithSubstitutions<ApplicationExpression>(inferredSubstitutions, {
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
