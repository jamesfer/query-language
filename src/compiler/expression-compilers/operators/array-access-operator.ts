import { every } from 'lodash';
import {
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../../../untyped-expression.model';
import { makeMessage } from '../../../message.model';
import { Token, TokenKind } from '../../../token.model';
import {
  makeFunctionCallExpression,
} from '../function/interpret-function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { buildList } from '../../compiler-utils/list';

const ArrayAccessPrecedence = 12;

let buildArrayAccessList = buildList(TokenKind.OpenBrace, TokenKind.CloseBrace, TokenKind.Comma, 3);

export function buildArrayAccessOperatorExpression(tokens: Token[], leftExpression: UntypedExpression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (leftExpression && operatorPrecedence < ArrayAccessPrecedence) {
    let list = buildArrayAccessList(tokens);
    if (list) {
      // Check if any indexes were given
      if (every(list.expressions, arg => arg.kind === 'None')) {
        list.messages.push(makeMessage('Warning', 'No indexes were supplied to array access expression. Remove the brackets to simplify.'));
      }

      const identifier = makeCustomIdentifierExpression('[]', []);
      return makeFunctionCallExpression(identifier, list.expressions, list.messages, list.tokens);
    }
  }
}



