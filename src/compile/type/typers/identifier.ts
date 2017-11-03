import { TypedExpressionInterface } from '../../../typed-expression.model';
import { IdentifierExpression } from '../../interpret/interpreters/identifier';
import { TypedScope } from '../typed-scope.model';
import { makeMessage, Message } from '../../../message.model';

export interface TypedIdentifierExpression extends TypedExpressionInterface<'Identifier'> {
  expression: IdentifierExpression;
}

export function parseIdentifierExpression(scope: TypedScope, expression: IdentifierExpression): TypedIdentifierExpression {
  let resultType = scope[expression.name] || null;
  let messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${expression.name}`),
  ];

  return {
    kind: 'Identifier',
    resultType,
    expression,
    messages,
  }
}