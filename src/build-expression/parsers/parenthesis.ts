import { Expression, ExpressionInterface } from '../../expression.model';
import { Token, TokenKind } from '../../token.model';
import { tokenArrayMatches } from '../../utils';
import { buildExpression } from '../build-expression';
import { makeUnrecognizedExpression } from './unrecognized';
import { makeMessage, Message } from '../../message.model';

export interface ParenthesisExpression extends ExpressionInterface<'Parenthesis'> {
  internalExpression: Expression | null;
}

export function makeParenthesisExpression(openParen: Token, internalExpression: Expression, closeParen: Token | null, messages: Message[] = []): ParenthesisExpression {
  let tokens = [openParen, ...internalExpression.tokens];
  if (closeParen) {
    tokens = [...tokens, closeParen];
  }

  return {
    kind: 'Parenthesis',
    internalExpression,
    tokens,
    messages,
  };
}

export function buildParenthesisExpression(tokens: Token[], prevExpression: Expression | null, operatorPrecedence: number): ParenthesisExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.OpenParen) && prevExpression === null) {
    let openParen = tokens[0];
    tokens = tokens.slice(1);
    let messages: Message[] = [];

    let expression = buildExpression(tokens);
    if (!expression) {
      expression = makeUnrecognizedExpression([]);
    }

    tokens = tokens.slice(expression.tokens.length);
    let closeParen: Token | null = null;
    if (tokenArrayMatches(tokens, TokenKind.CloseParen)) {
      if (expression.tokens.length === 0) {
        messages.push(makeMessage('Error', 'Parenthesis expression had an empty body.'))
      }
      closeParen = tokens[0];
    }
    else {
      messages.push(makeMessage('Error', 'Missing closing parenthesis.'));
    }
    return makeParenthesisExpression(openParen, expression, closeParen, messages);
  }
}
