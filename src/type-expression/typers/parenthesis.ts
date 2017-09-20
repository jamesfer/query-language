import { TypedScope } from '../typed-scope.model';
import { ParenthesisExpression } from '../../build-expression/parsers/parenthesis';
import {
  TypedExpression,
  TypedExpressionInterface,
} from '../../typed-expression.model';
import { makeUnrecognizedExpression, typeSyntaxTree } from '../type-expression';

export interface TypedParenthesisExpression extends TypedExpressionInterface<'Parenthesis', ParenthesisExpression> {
  internalExpression: TypedExpression,
}

export function parseParenthesisExpression(scope: TypedScope, expression: ParenthesisExpression): TypedParenthesisExpression {
  let internalExpression: TypedExpression | null = null;
  if (expression.internalExpression) {
    internalExpression = typeSyntaxTree(scope, expression.internalExpression);
  }
  if (!internalExpression) {
    internalExpression = makeUnrecognizedExpression(scope, expression);
  }

  return {
    kind: 'Parenthesis',
    resultType: internalExpression.resultType,
    internalExpression,
    expression,
    messages: [],
  }
}
