import {
  makeUntypedUnrecognizedExpression,
  UntypedExpression,
} from '../../untyped-expression';
import { makeMessage } from '../../message';
import { Token, TokenKind } from '../../token';
import { tokenArrayMatches } from '../../utils';
import { interpretExpression } from '../interpret-expression';
import { last } from 'lodash';

export function interpretParenthesis(tokens: Token[], prevExpression: UntypedExpression | null, operatorPrecedence: number): UntypedExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.OpenParen) && prevExpression === null) {
    let openParen = tokens[0];
    tokens = tokens.slice(1);

    let expression = interpretExpression(tokens);
    if (expression) {
      tokens = tokens.slice(expression.tokens.length);
      expression.tokens = [openParen, ...expression.tokens];

      if (tokenArrayMatches(tokens, TokenKind.CloseParen)) {
        expression.tokens.push(tokens[0]);
      }
      else {
        // expression.tokens should always have at least one token in it at this
        // point, but check for safety.
        const lastToken = last(expression.tokens) || openParen;
        expression.messages.push(makeMessage('Error', 'Missing closing parenthesis.', lastToken));
      }
      return expression;
    }
    else if (tokenArrayMatches(tokens, TokenKind.CloseParen)) {
      return makeUntypedUnrecognizedExpression(
        [ openParen, tokens[0] ],
        [ makeMessage('Error', 'Empty parenthesis.', openParen, tokens[0]) ]
      );
    }
  }
}
