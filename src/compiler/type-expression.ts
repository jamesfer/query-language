import { UntypedExpression } from '../untyped-expression.model';
import {
  addType,
  Expression,
  NoneExpression,
} from '../expression.model';
import { assertNever } from '../utils';
import { UntypedNoneExpression } from '../untyped-expression.model';
import { TypedScope } from './typed-scope.model';
import { parseArrayExpression } from './expression-compilers/array';
import { parseFunctionCallExpression } from './expression-compilers/function/type-function-call';
import { parseIdentifierExpression } from './expression-compilers/identifier';
import { parseNumericExpression } from './expression-compilers/numeric';
import { parseStringExpression } from './expression-compilers/string';
import { NoneType } from '../type.model';
import { parseBooleanExpression } from './expression-compilers/boolean';


export function typeSyntaxTree(scope: TypedScope, expression: UntypedExpression): Expression {
  switch (expression.kind) {
    case 'String':
      return parseStringExpression(scope, expression);
    case 'Integer':
    case 'Float':
      return parseNumericExpression(scope, expression);
    case 'Boolean':
      return parseBooleanExpression(scope, expression);
    case 'Array':
      return parseArrayExpression(scope, expression);
    case 'Identifier':
      return parseIdentifierExpression(scope, expression);
    case 'FunctionCall':
      return parseFunctionCallExpression(scope, expression);
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


