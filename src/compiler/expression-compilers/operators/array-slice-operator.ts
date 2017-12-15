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
import { buildListInterpreter } from '../../compiler-utils/interpret-list';

const ArraySlicePrecedence = 12;

let buildArrayAccessList = buildListInterpreter(TokenKind.OpenBrace, TokenKind.CloseBrace, TokenKind.Comma, 3);

export function interpretArraySliceOperator(tokens: Token[], leftExpression: UntypedExpression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (leftExpression && operatorPrecedence < ArraySlicePrecedence) {
    let list = buildArrayAccessList(tokens);
    if (list) {
      // Check if any indexes were given
      if (every(list.expressions, arg => arg.kind === 'None')) {
        list.messages.push(makeMessage('Warning', 'No indexes were supplied to array slice expression. Remove the brackets to simplify.'));
      }

      const identifier = makeCustomIdentifierExpression('[]', []);
      return makeFunctionCallExpression(identifier, list.expressions, list.messages, list.tokens);
    }
  }
}



