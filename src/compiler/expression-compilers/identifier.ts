import { addType, IdentifierExpression, } from '../../expression.model';
import { makeMessage, Message } from '../../message.model';
import { Token, TokenKind } from '../../token.model';
import { UntypedIdentifierExpression, } from '../../untyped-expression.model';
import { tokenArrayMatches } from '../../utils';
import { LazyValue } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';
import { TypedScope } from '../typed-scope.model';


export function makeIdentifierExpression(token: Token): UntypedIdentifierExpression {
  return makeCustomIdentifierExpression(token.value, [token]);
}

export function makeCustomIdentifierExpression(name: string, tokens: Token[], messages: Message[] = []): UntypedIdentifierExpression {
  return {
    kind: 'Identifier',
    value: name,
    tokens,
    messages,
  }
}

export function interpretIdentifier(tokens: Token[]): UntypedIdentifierExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.Identifier)) {
    return makeIdentifierExpression(tokens[0]);
  }
}

export function typeIdentifier(scope: TypedScope, expression: UntypedIdentifierExpression): IdentifierExpression {
  let resultType = scope[expression.value] || null;
  let messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${expression.value}`),
  ];

  return addType(expression, resultType, messages);
}

export function evaluateIdentifier(scope: EvaluationScope, expression: IdentifierExpression): LazyValue {
  return scope[expression.value];
}