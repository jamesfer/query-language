import { UntypedIdentifierExpression } from '../../../untyped-expression.model';
import { makeMessage, Message } from '../../../message.model';
import { TypedIdentifierExpression, } from '../../../typed-expression.model';
import { TypedScope } from '../typed-scope.model';

export function parseIdentifierExpression(scope: TypedScope, expression: UntypedIdentifierExpression): TypedIdentifierExpression {
  let resultType = scope[expression.value] || null;
  let messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${expression.value}`),
  ];

  return {
    kind: 'Identifier',
    resultType,
    expression,
    messages,
    value: expression.value,
  }
}
