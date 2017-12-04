import { UntypedNumericLiteralExpression, } from '../../../../untyped-expression.model';
import { makeMessage, Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';

export function makeNumericLiteralExpression(token: Token, messages: Message[] = []): UntypedNumericLiteralExpression {
  return {
    kind: 'NumericLiteral',
    tokens: [token],
    value: token.value,
    messages,
  };
}

export function makeCustomNumericLiteralExpression(contents: string, messages: Message[] = []): UntypedNumericLiteralExpression {
  return {
    kind: 'NumericLiteral',
    tokens: [],
    value: contents,
    messages,
  };
}

export function buildNumericLiteralExpression(tokens: Token[]): UntypedNumericLiteralExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.NumericLiteral)) {
    const token = tokens[0];
    const value = +token.value;

    let messages: Message[] = [];
    if (isNaN(value)) {
      messages.push(makeMessage('Error', 'Not a valid number.'));
    }
    else if (value >= Number.MAX_VALUE) {
      messages.push(makeMessage('Error', 'Value is larger than the maximum value of ' + Number.MAX_VALUE));
    }
    else if (value <= Number.MIN_VALUE) {
      messages.push(makeMessage('Error', 'Value is smaller than the minimum value of ' + Number.MIN_VALUE));
    }
    return makeNumericLiteralExpression(token, messages);
  }
}
