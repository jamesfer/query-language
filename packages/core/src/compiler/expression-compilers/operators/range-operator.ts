import { UntypedExpression, UntypedFunctionCallExpression } from '../../../untyped-expression';
import { makeMessage, Message } from '../../../message';
import { Token, TokenKind } from '../../../token';
import { tokenArrayMatches } from '../../../utils';
import { interpretExpression } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function/interpret-function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { makeIntegerExpression } from '../number';
import { hasHigherPrecedence, precedences } from './precedences';


export function interpretRangeOperator(
  incomingTokens: Token[],
  leftExpression: UntypedExpression | null,
  prevPrecedence: number,
): UntypedFunctionCallExpression | undefined {
  let tokens = incomingTokens;
  const hasPrecedence = hasHigherPrecedence(precedences.range, prevPrecedence);
  if (tokenArrayMatches(tokens, TokenKind.RangeOperator) && hasPrecedence) {
    const rangeToken: Token = tokens[0];
    tokens = tokens.slice(1);

    const rightExpression = interpretExpression(tokens, null, precedences.range.precedence);

    const messages: Message[] = [];
    if (!leftExpression && !rightExpression) {
      messages.push(makeMessage(
        'Error',
        'Range operator was not given a lower or an upper bound.',
        rangeToken,
      ));
    }

    const start = leftExpression || makeIntegerExpression(0, rangeToken);
    const end = rightExpression || makeIntegerExpression(Infinity, rangeToken);

    const identifier = makeCustomIdentifierExpression('..', [rangeToken]);
    return makeFunctionCallExpression(identifier, [start, end], messages, [
      ...leftExpression ? leftExpression.tokens : [],
      ...rightExpression ? rightExpression.tokens : [],
    ]);
  }
}
