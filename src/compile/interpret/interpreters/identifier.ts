import { UntypedIdentifierExpression, } from '../../../untyped-expression.model';
import { Message } from '../../../message.model';
import { Token, TokenKind } from '../../../token.model';
import { tokenArrayMatches } from '../../../utils';

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

export function buildIdentifierExpression(tokens: Token[]): UntypedIdentifierExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.Identifier)) {
    return makeIdentifierExpression(tokens[0]);
  }
}
