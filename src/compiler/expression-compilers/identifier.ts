import { addType, IdentifierExpression, } from '../../expression';
import { makeMessage, Message } from '../../message';
import { findScopeType, findScopeValue, Scope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { UntypedIdentifierExpression, } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { LazyNoneValue, LazyValue } from '../../value';


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

export function typeIdentifier(scope: Scope, expression: UntypedIdentifierExpression): IdentifierExpression {
  let resultType = findScopeType(scope, expression.value);
  let messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${expression.value}`, expression.tokens[0]),
  ];

  return addType(expression, resultType, messages);
}

export function evaluateIdentifier(scope: Scope, expression: IdentifierExpression): LazyValue {
  return findScopeValue(scope, expression.value) || LazyNoneValue;
}
