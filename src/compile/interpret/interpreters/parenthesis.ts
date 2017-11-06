import { Expression } from '../../../expression.model';
import { makeMessage } from '../../../message.model';
import { Token, TokenKind } from '../../../token.model';
import { tokenArrayMatches } from '../../../utils';
import { buildExpression } from '../interpret-expression';

export function buildParenthesisExpression(tokens: Token[], prevExpression: Expression | null, operatorPrecedence: number): Expression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.OpenParen) && prevExpression === null) {
    let openParen = tokens[0];
    tokens = tokens.slice(1);
    let expression = buildExpression(tokens);
    if (expression) {
      tokens = tokens.slice(expression.tokens.length);
      expression.tokens = [openParen, ...expression.tokens];
      if (tokenArrayMatches(tokens, TokenKind.CloseParen)) {
        // if (!expression) {
        //   messages.push(makeMessage('Error', 'Parenthesis expression had an empty body.'))
        // }
        expression.tokens.push(tokens[0]);
      }
      else {
        expression.messages.push(makeMessage('Error', 'Missing closing parenthesis.'));
      }
      return expression;
    }
  }
}
