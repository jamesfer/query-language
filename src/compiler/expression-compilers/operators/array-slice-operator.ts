import { every, first, last } from 'lodash';
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
import { hasHigherPrecedence, precedences } from './precedences';

let buildArrayAccessList = buildListInterpreter(TokenKind.OpenBrace, TokenKind.CloseBrace, TokenKind.Comma, 3);

export function interpretArraySliceOperator(tokens: Token[], leftExpression: UntypedExpression | null, prevPrecedence: number): UntypedFunctionCallExpression | undefined {
  const hasPrecedence = hasHigherPrecedence(precedences.slice, prevPrecedence);
  if (leftExpression && hasPrecedence) {
    let list = buildArrayAccessList(tokens);
    if (list) {
      const identifier = makeCustomIdentifierExpression('[]', []);
      const expression = makeFunctionCallExpression(identifier, list.expressions, list.messages, list.tokens);

      // Check if any indexes were given
      if (every(list.expressions, arg => arg.kind === 'None')) {
        const firstToken = first(expression.tokens) || tokens[0];
        const lastToken = last(expression.tokens);
        expression.messages.push(makeMessage(
          'Warning',
          'No indexes were supplied to array slice expression. Remove the brackets to simplify.',
          firstToken,
          lastToken,
        ));
      }

      return expression;
    }
  }
}
