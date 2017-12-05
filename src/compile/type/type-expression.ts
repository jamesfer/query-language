import { UntypedExpression } from '../../untyped-expression.model';
import {
  addType,
  Expression,
  NoneExpression,
} from '../../expression.model';
import { assertNever } from '../../utils';
import { UntypedNoneExpression } from '../../untyped-expression.model';
import { TypedScope } from './typed-scope.model';
import { parseArrayExpression } from './typers/array';
import { parseFunctionCallExpression } from './typers/function-call';
import { parseIdentifierExpression } from './typers/identifier';
import { parseNumericExpression } from './typers/numeric';
import { parseStringExpression } from './typers/string';
import { NoneType } from '../../type.model';


export function typeSyntaxTree(scope: TypedScope, expression: UntypedExpression): Expression {
  switch (expression.kind) {
    case 'String':
      return parseStringExpression(scope, expression);
    case 'Numeric':
      return parseNumericExpression(scope, expression);
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


