import { every, first, last } from 'lodash';
import { makeMessage } from '../../../message';
import { TokenKind } from '../../../token';
import { buildListInterpreter } from '../../compiler-utils/interpret-list';
import { Log } from '../../compiler-utils/monoids/log';
import { ExpressionInterpreter } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { hasHigherPrecedence, precedences } from './precedences';

const buildArrayAccessList
  = buildListInterpreter(TokenKind.OpenBrace, TokenKind.CloseBrace, TokenKind.Comma, 3);

export const interpretArraySliceOperator: ExpressionInterpreter = (tokens, left, precedence) => {
  const hasPrecedence = hasHigherPrecedence(precedences.slice, precedence);
  if (left && hasPrecedence) {
    const log = Log.empty();
    const result = log.combine(buildArrayAccessList(tokens));
    if (result) {
      const identifier = makeCustomIdentifierExpression('[]', []);
      const expression = makeFunctionCallExpression(
        identifier,
        result.expressions,
        result.tokens,
      );

      // Check if any indexes were given
      if (every(result.expressions, arg => arg.kind === 'None')) {
        const firstToken = first(expression.tokens) || tokens[0];
        const lastToken = last(expression.tokens);
        log.push(makeMessage(
          'Warning',
          'No indexes were supplied to array slice expression. Remove the brackets to simplify.',
          firstToken,
          lastToken,
        ));
      }

      return log.wrap(expression);
    }
  }
  return Log.of(undefined);
};
