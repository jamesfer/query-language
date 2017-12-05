import { UntypedNumericExpression, } from '../../../../untyped-expression.model';
import { makeMessage, Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';

export function makeNumericExpression(token: Token, messages: Message[] = []): UntypedNumericExpression {
  return {
    kind: 'Numeric',
    tokens: [token],
    value: token.value,
    messages,
  };
}

export function makeCustomNumericExpression(contents: string, messages: Message[] = []): UntypedNumericExpression {
  return {
    kind: 'Numeric',
    tokens: [],
    value: contents,
    messages,
  };
}

export function buildNumericExpression(tokens: Token[]): UntypedNumericExpression | undefined {
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
    return makeNumericExpression(token, messages);
  }
}
