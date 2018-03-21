import { Scope } from '../scope';
import { UntypedExpression } from '../untyped-expression';
import {
  addType,
  Expression,
  NoneExpression,
} from '../expression';
import { assertNever } from '../utils';
import { UntypedNoneExpression } from '../untyped-expression';
import { typeArray } from './expression-compilers/array';
import { typeFunctionCall } from './expression-compilers/function/type-function-call';
import { typeIdentifier } from './expression-compilers/identifier';
import { typeNumber } from './expression-compilers/number';
import { typeString } from './expression-compilers/string';
import { noneType } from '../type/constructors';
import { typeBoolean } from './expression-compilers/boolean';


export function typeExpression(scope: Scope, expression: UntypedExpression): Expression {
  switch (expression.kind) {
    case 'String':
      return typeString(scope, expression);
    case 'Integer':
    case 'Float':
      return typeNumber(scope, expression);
    case 'Boolean':
      return typeBoolean(scope, expression);
    case 'Array':
      return typeArray(scope, expression);
    case 'Identifier':
      return typeIdentifier(scope, expression);
    case 'FunctionCall':
      return typeFunctionCall(scope, expression);
    case 'None':
      return makeNoneExpression(scope, expression);
    case 'Unrecognized':
    case 'Function':
      return makeUnrecognizedExpression(scope, expression);
    default:
      return assertNever(expression);
  }
}

export function makeNoneExpression(scope: Scope, expression: UntypedNoneExpression): NoneExpression {
  return addType(expression, noneType);
}

export function makeUnrecognizedExpression(scope: Scope, expression: UntypedExpression): Expression {
  return addType(expression, null);
}


