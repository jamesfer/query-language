import { makeMessage, Message } from '../../../message.model';
import { TypedExpressionInterface } from '../../../typed-expression.model';
import { IdentifierExpression } from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';

export interface TypedIdentifierExpression extends TypedExpressionInterface<'Identifier'> {
  expression: IdentifierExpression;
}

export function parseIdentifierExpression(scope: TypedScope, expression: IdentifierExpression): TypedIdentifierExpression {
  let resultType = scope[expression.value] || null;
  let messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${expression.value}`),
  ];

  return {
    kind: 'Identifier',
    resultType,
    expression,
    messages,
  }
}
