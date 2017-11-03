import { Token, TokenKind } from '../../../../token.model';
import { Expression, ExpressionInterface } from '../../../../expression.model';
import { tokenArrayMatches } from '../../../../utils';
import { makeMessage, Message } from '../../../../message.model';
import { head, last } from 'lodash';

export interface StringLiteralExpression extends ExpressionInterface<'StringLiteral'> {
  contents: string;
}

function makeStringLiteralExpression(token: Token, messages: Message[] = []): StringLiteralExpression {
  return {
    kind: 'StringLiteral',
    tokens: [token],
    contents: token.value,
    messages,
  };
}

export function buildStringLiteralExpression(tokens: Token[]): Expression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.StringLiteral)) {
    let messages: Message[] = [];
    let strToken = tokens[0];
    if (head(strToken.value) !== last(strToken.value)) {
      messages.push(makeMessage('Error', 'String literal is missing closing quote.'));
    }
    return makeStringLiteralExpression(strToken, messages);
  }
}