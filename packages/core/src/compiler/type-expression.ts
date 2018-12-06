import { Scope, TypeScope, TypeVariableScope } from '../scope';
import { UntypedExpression, UntypedNoneExpression } from '../untyped-expression';
import { addType, Expression, NoneExpression } from '../expression';
import { assertNever } from '../utils';
import { LogTypeScope, LogTypeScopeState, LogTypeScopeValue } from './compiler-utils/monoids/log-type-scope';
import { typeArray } from './expression-compilers/array';
import { typeFunction } from './expression-compilers/function';
import { typeFunctionCall } from './expression-compilers/function-call/type-function-call';
import { typeIdentifier } from './expression-compilers/identifier';
import { typeNumber } from './expression-compilers/number';
import { typeString } from './expression-compilers/string';
import { noneType } from '../type/constructors';
import { typeBoolean } from './expression-compilers/boolean';
import { TypeVariables } from './compiler-utils/monoids/type-variables';

export type ExpressionTyper<E extends UntypedExpression = UntypedExpression> = (
  scope: TypeScope,
  typeVariables: TypeVariableScope,
  expression: E,
) => LogTypeScopeValue<Expression>;

export const typeExpression: ExpressionTyper = (scope, typeVariables, expression) => {
  switch (expression.kind) {
    case 'String':
      return typeString(scope, typeVariables, expression);
    case 'Integer':
    case 'Float':
      return typeNumber(scope, typeVariables, expression);
    case 'Boolean':
      return typeBoolean(scope, typeVariables, expression);
    case 'Array':
      return typeArray(scope, typeVariables, expression);
    case 'Identifier':
      return typeIdentifier(scope, typeVariables, expression);
    case 'FunctionCall':
      return typeFunctionCall(scope, typeVariables, expression);
    case 'Function':
      return typeFunction(scope, typeVariables, expression);
    case 'None':
      return LogTypeScope.fromVariables(typeVariables).wrap(makeNoneExpression(expression));
    case 'Unrecognized':
      return LogTypeScope.fromVariables(typeVariables).wrap(makeUnrecognizedExpression(expression));
    default:
      return assertNever(expression);
  }
};

export function makeNoneExpression(expression: UntypedNoneExpression): NoneExpression {
  return addType(expression, noneType);
}

export function makeUnrecognizedExpression(expression: UntypedExpression): Expression {
  return addType(expression, null);
}


