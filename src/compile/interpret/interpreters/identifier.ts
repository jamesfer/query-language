import { ExpressionInterface } from '../../../expression.model';
import { Message } from '../../../message.model';
import { Token, TokenKind } from '../../../token.model';
import { tokenArrayMatches } from '../../../utils';

export interface IdentifierExpression extends ExpressionInterface<'Identifier'> {
  name: string;
}

export function makeIdentifierExpression(token: Token): IdentifierExpression {
  return makeCustomIdentifierExpression(token.value, [token]);
}

export function makeCustomIdentifierExpression(name: string, tokens: Token[], messages: Message[] = []): IdentifierExpression {
  return {
    kind: 'Identifier',
    name,
    tokens,
    messages,
  }
}

export function buildIdentifierExpression(tokens: Token[]): IdentifierExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.Identifier)) {
    return makeIdentifierExpression(tokens[0]);
  }
}
