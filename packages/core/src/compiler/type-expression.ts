import { Expression, ExpressionKind, NothingExpression } from '../type6Lazy/expression';
import { InferredTypesScope, TypeScope } from '../type6Lazy/scope';
import { nothing } from '../type6Lazy/value-constructors';
import { UntypedExpression, UntypedNoneExpression } from '../untyped-expression';
import { assertNever } from '../utils';
import { LogTypeScope, LogTypeScopeValue } from './compiler-utils/monoids/log-type-scope';
import { typeArray } from './expression-compilers/array';
import { typeFunction } from './expression-compilers/function';
import { typeFunctionCall } from './expression-compilers/function-call/type-function-call';
import { typeIdentifier } from './expression-compilers/identifier';
import { typeNumber } from './expression-compilers/number';
import { typeString } from './expression-compilers/string';
import { typeBoolean } from './expression-compilers/boolean';

// TODO this should be asynchronous using lazy types
export type ExpressionTyper<E extends UntypedExpression = UntypedExpression> = (
  scope: TypeScope,
  inferredTypes: InferredTypesScope,
  expression: E,
) => LogTypeScopeValue<Expression>;

export const typeExpression: ExpressionTyper = (scope, inferredTypes, expression) => {
  switch (expression.kind) {
    case 'String':
      return typeString(scope, inferredTypes, expression);
    case 'Integer':
    case 'Float':
      return typeNumber(scope, inferredTypes, expression);
    case 'Boolean':
      return typeBoolean(scope, inferredTypes, expression);
    case 'Array':
      return typeArray(scope, inferredTypes, expression);
    case 'Identifier':
      return typeIdentifier(scope, inferredTypes, expression);
    case 'FunctionCall':
      return typeFunctionCall(scope, inferredTypes, expression);
    case 'Function':
      return typeFunction(scope, inferredTypes, expression);
    case 'None':
      return LogTypeScope.fromVariables(inferredTypes).wrap(makeNoneExpression(expression));
    case 'Unrecognized':
      // TODO handle errors better
      throw new Error('Tried to type an unrecognized expression');
    default:
      return assertNever(expression);
  }
};

export function makeNoneExpression(expression: UntypedNoneExpression): NothingExpression {
  return {
    kind: ExpressionKind.Nothing,
    tokens: expression.tokens,
    resultType: nothing,
  };
}
