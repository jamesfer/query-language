import { Token, TokenKind } from '../../../token.model';
import { FunctionCallExpression, makeFunctionCallExpression } from '../function-call';
import { Expression } from '../../../expression.model';
import { makeCustomIdentifierExpression } from '../identifier';
import { every } from 'lodash';
import { makeMessage } from '../../../message.model';
import { buildList } from '../util/list';

const ArrayAccessPrecedence = 12;

let buildArrayAccessList = buildList(TokenKind.OpenBrace, TokenKind.CloseBrace, TokenKind.Comma, 3);

export function buildArrayAccessOperatorExpression(tokens: Token[], leftExpression: Expression | null, operatorPrecedence: number): FunctionCallExpression | undefined {
  if (leftExpression && operatorPrecedence < ArrayAccessPrecedence) {
    let list = buildArrayAccessList(tokens);
    if (list) {
      // Check if any indexes were given
      if (every(list.expressions, arg => arg.kind === 'NoneLiteral')) {
        list.messages.push(makeMessage('Warning', 'No indexes were supplied to array access expression. Remove the brackets to simplify.'));
      }

      const identifier = makeCustomIdentifierExpression('[]', []);
      return makeFunctionCallExpression(identifier, list.expressions, list.tokens, list.messages);
    }
  }
}



