import { head, last } from 'lodash';
import {
  UntypedExpression,
  UntypedStringExpression,
} from '../../../../untyped-expression.model';
import { makeMessage, Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';

function makeStringExpression(token: Token, messages: Message[] = []): UntypedStringExpression {
  const value = token.value;
  const contents = last(value) === value[0]
    ? value.slice(1, -1)
    : value.slice(1);
  return {
    kind: 'String',
    tokens: [token],
    value: contents,
    messages,
  };
}

export function buildStringExpression(tokens: Token[]): UntypedExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.StringLiteral)) {
    let messages: Message[] = [];
    let strToken = tokens[0];
    if (head(strToken.value) !== last(strToken.value)) {
      messages.push(makeMessage('Error', 'String literal is missing closing quote.'));
    }
    return makeStringExpression(strToken, messages);
  }
}
