import { UntypedExpression } from '../untyped-expression.model';
import {
  addType,
  Expression,
  NoneExpression,
} from '../expression.model';
import { assertNever } from '../utils';
import { UntypedNoneExpression } from '../untyped-expression.model';
import { TypedScope } from './typed-scope.model';
import { typeArray } from './expression-compilers/array';
import { typeFunctionCall } from './expression-compilers/function/type-function-call';
import { typeIdentifier } from './expression-compilers/identifier';
import { typeNumber } from './expression-compilers/number';
import { typeString } from './expression-compilers/string';
import { NoneType } from '../type.model';
import { typeBoolean } from './expression-compilers/boolean';


export function typeExpression(scope: TypedScope, expression: UntypedExpression): Expression {
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
      return makeUnrecognizedExpression(scope, expression);
    default:
      return assertNever(expression);
  }
}

export function makeNoneExpression(scope: TypedScope, expression: UntypedNoneExpression): NoneExpression {
  return addType(expression, NoneType);
}

export function makeUnrecognizedExpression(scope: TypedScope, expression: UntypedExpression): Expression {
  return addType(expression, null);
}

