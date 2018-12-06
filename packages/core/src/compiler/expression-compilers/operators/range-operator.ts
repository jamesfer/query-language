import { makeMessage } from '../../../message';
import { Token, TokenKind } from '../../../token';
import { tokenArrayMatches } from '../../../utils';
import { ExpressionInterpreter, interpretExpression } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function-call/interpret-function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { makeIntegerExpression } from '../number';
import { hasHigherPrecedence, precedences } from './precedences';
import { Log } from '../../compiler-utils/monoids/log';


export const interpretRangeOperator: ExpressionInterpreter = (incomingTokens, left, precedence) => {
  let tokens = incomingTokens;
  const hasPrecedence = hasHigherPrecedence(precedences.range, precedence);
  if (tokenArrayMatches(tokens, TokenKind.RangeOperator) && hasPrecedence) {
    const log = Log.empty();
    const rangeToken: Token = tokens[0];
    tokens = tokens.slice(1);

    const rightExpression = log.combine(interpretExpression(
      tokens,
      null,
      precedences.range.precedence,
    ));

    if (!left && !rightExpression) {
      log.push(makeMessage(
        'Error',
        'Range operator was not given a lower or an upper bound.',
        rangeToken,
      ));
    }

    const start = left || makeIntegerExpression(0, rangeToken);
    const end = rightExpression || makeIntegerExpression(Infinity, rangeToken);

    const identifier = makeCustomIdentifierExpression('..', [rangeToken]);
    return log.wrap(makeFunctionCallExpression(identifier, [start, end], [
      ...left ? left.tokens : [],
      ...rightExpression ? rightExpression.tokens : [],
    ]));
  }
  return Log.of(undefined);
};
