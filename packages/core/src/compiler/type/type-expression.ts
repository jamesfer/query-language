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
import {
  applyInferredSubstitutionsToScope,
  createChildScope,
  findVariableTypeInScope,
  TypeScope,
} from '../scope';
import { pMap } from '../utils';
import {
  booleanType,
  floatType,
  functionType,
  integerType,
  lazyValue,
  listType,
  nothing,
  stringType,
} from '../value-constructors';
import { convergeManyTypes, convergeTypes } from './converge-types';
import { findImplicits } from './find-implicits';
import { makeInferredFunctionType } from './make-inferred-function-type';
import { State, StateResult } from './state';
import { type } from './type';
import { freeBoundVariable, freeVariable } from './utils';
import { applySubstitutions } from './variable-substitutions';

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
        resultType: type(variable ? variable : lazyValue(nothing)),
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
      const [inferredSubstitutions, convergedSubstitutions, substitutionArray, converged] = await state.runAsync(
        convergeManyTypes,
        elementTypes,
      );

      // TODO we might also need to apply these substitutions to each of the expressions too
      state.setScope(applyInferredSubstitutionsToScope(state.scope(), inferredSubstitutions));

      if (!converged) {
        state.log(makeMessage(
          'Error',
          'Array element does not match element type',
          tokens[0],
          tokens[tokens.length - 1],
        ));
      }

      return state.wrapWithSubstitutions<ListExpression>(convergedSubstitutions, {
        tokens,
        kind: ExpressionKind.List,
        resultType: type(lazyValue(converged ? listType(converged) : nothing)),
        // Check if we can imply any interfaces for each of the elements
        elements: converged
          ? await pMap(typedElements, state.runAsync1P1(findImplicits, substitutionArray[0]))
          : typedElements,
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
          valueType: lazyValue(value),
        }))),
      });
      const childState = State.of(childScope);

      // Type the function body which will attempt to infer the parameter types and update the scope
      const typedBody = await childState.runAsync(typeExpression, expression.value);

      // Determine the type of the whole function
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
      // TODO throw error if callee is not callable

      // Type each of the arguments
      const typedParameters = await pMap(expression.args, state.runAsyncP1(typeExpression));

      // Create a variable to represent the return value of the function
      const parameterTypes = typedParameters.map(parameter => parameter.resultType.value);
      const resultVariable = lazyValue(await freeVariable('result', [
        typedCallee.resultType.value,
        ...parameterTypes,
      ]));

      // Converge the callee type with the parameter types
      // TODO check if the value actually converged and throw error if it didn't
      const [substitutions,] = await state.runAsync(
        convergeTypes,
        typedCallee.resultType.value,
        functionType(...parameterTypes, resultVariable),
      );

      // Find the result type of the function
      const resultType = applySubstitutions(substitutions.right, resultVariable);
      state.setScope(applyInferredSubstitutionsToScope(state.scope(), substitutions.inferred));

      // TODO throw error if too many parameters are given
      // if (i >= expectedParameters.length) {
      //     // TODO correctly place this error message
      //     state.log(makeMessage(
      //       'Error',
      //       `Too many parameters passed to function. Expected ${expectedParameters.length}, given ${parameters.length}.`,
      //       [0, 0],
      //     ));
      // }

      return state.wrap<ApplicationExpression>({
        resultType: type(resultType),
        kind: ExpressionKind.Application,
        tokens: expression.tokens,
        implicitParameters: [],
        parameters: typedParameters,
        callee: typedCallee,
      })
    }

    case 'Unrecognized':
      // TODO handle errors better
      throw new Error('Cannot type unrecognized expression');

    default:
      return assertNever(expression);
  }
}
