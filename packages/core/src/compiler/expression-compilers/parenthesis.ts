import { makeUntypedUnrecognizedExpression, UntypedExpression } from '../../untyped-expression';
import { makeMessage } from '../../message';
import { Token, TokenKind } from '../../token';
import { tokenArrayMatches } from '../../utils';
import { interpretExpression } from '../interpret-expression';
import { last } from 'lodash';

export function interpretParenthesis(
  incomingTokens: Token[],
  prevExpression: UntypedExpression | null,
  operatorPrecedence: number,
): UntypedExpression | undefined {
  if (tokenArrayMatches(incomingTokens, TokenKind.OpenParen) && prevExpression === null) {
    const openParen = incomingTokens[0];
    let tokens = incomingTokens.slice(1);

    const expression = interpretExpression(tokens);
    if (expression) {
      tokens = tokens.slice(expression.tokens.length);
      expression.tokens = [openParen, ...expression.tokens];

      if (tokenArrayMatches(tokens, TokenKind.CloseParen)) {
        expression.tokens.push(tokens[0]);
      } else {
        // expression.tokens should always have at least one token in it at this
        // point, but check for safety.
        const lastToken = last(expression.tokens) || openParen;
        expression.messages.push(makeMessage('Error', 'Missing closing parenthesis.', lastToken));
      }
      return expression;
    }
    if (tokenArrayMatches(tokens, TokenKind.CloseParen)) {
      return makeUntypedUnrecognizedExpression(
        [openParen, tokens[0]],
        [makeMessage('Error', 'Empty parenthesis.', openParen, tokens[0])],
      );
    }
  }
}
