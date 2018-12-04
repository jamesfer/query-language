import { every, first, last } from 'lodash';
import { makeMessage } from '../../../message';
import { TokenKind } from '../../../token';
import { ExpressionInterpreter } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function-call/interpret-function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { buildListInterpreter } from '../../compiler-utils/interpret-list';
import { hasHigherPrecedence, precedences } from './precedences';
import { normalizeMessageResult } from '../../compiler-utils/message-store';

const buildArrayAccessList
  = buildListInterpreter(TokenKind.OpenBrace, TokenKind.CloseBrace, TokenKind.Comma, 3);

export const interpretArraySliceOperator: ExpressionInterpreter = (tokens, left, precedence) => {
  const hasPrecedence = hasHigherPrecedence(precedences.slice, precedence);
  if (left && hasPrecedence) {
    const result = buildArrayAccessList(tokens);
    if (result) {
      const [list, messages] = result;
      const identifier = makeCustomIdentifierExpression('[]', []);
      const expression = makeFunctionCallExpression(
        identifier,
        list.expressions,
        normalizeMessageResult(messages),
        list.tokens,
      );

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
  return undefined;
};
