import { Expression } from '../../expression.model';
import {
  TypedExpression,
  TypedNoneLiteralExpression,
} from '../../typed-expression.model';
import { assertNever } from '../../utils';
import { NoneExpression } from '../../expression.model';
import { TypedScope } from './typed-scope.model';
import { parseArrayLiteral } from './typers/array-literal';
import { parseFunctionCallExpression } from './typers/function-call';
import { parseIdentifierExpression } from './typers/identifier';
import { parseNumericLiteral } from './typers/numeric-literal';
import { parseStringLiteral } from './typers/string-literal';


export function typeSyntaxTree(scope: TypedScope, expression: Expression): TypedExpression {
  switch (expression.kind) {
    case 'StringLiteral':
      return parseStringLiteral(scope, expression);
    case 'NumericLiteral':
      return parseNumericLiteral(scope, expression);
    case 'ArrayLiteral':
      return parseArrayLiteral(scope, expression);
    case 'Identifier':
      return parseIdentifierExpression(scope, expression);
    case 'FunctionCall':
      return parseFunctionCallExpression(scope, expression);
    case 'NoneLiteral':
      return makeNoneExpression(scope, expression);
    case 'Unrecognized':
      return makeUnrecognizedExpression(scope, expression);
    default:
      return assertNever(expression);
  }
}

export function makeNoneExpression(scope: TypedScope, expression: NoneExpression): TypedNoneLiteralExpression {
  return {
    kind: 'NoneLiteral',
    resultType: { kind: 'None' },
    messages: [],
    expression,
  };
}

export function makeUnrecognizedExpression(scope: TypedScope, expression: Expression): TypedExpression {
  return {
    kind: 'Unrecognized',
    expression,
    resultType: null,
    messages: [],
  }
}


