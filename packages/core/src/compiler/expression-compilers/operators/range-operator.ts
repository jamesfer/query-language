import { UntypedExpression, UntypedFunctionCallExpression } from '../../../untyped-expression';
import { makeMessage, Message } from '../../../message';
import { Token, TokenKind } from '../../../token';
import { tokenArrayMatches } from '../../../utils';
import { ExpressionInterpreter, interpretExpression } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function-call/interpret-function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { makeIntegerExpression } from '../number';
import { hasHigherPrecedence, precedences } from './precedences';


export const interpretRangeOperator: ExpressionInterpreter = (incomingTokens, left, precedence) => {
  let tokens = incomingTokens;
  const hasPrecedence = hasHigherPrecedence(precedences.range, precedence);
  if (tokenArrayMatches(tokens, TokenKind.RangeOperator) && hasPrecedence) {
    const rangeToken: Token = tokens[0];
    tokens = tokens.slice(1);

    const rightExpression = interpretExpression(tokens, null, precedences.range.precedence);

    const messages: Message[] = [];
    if (!left && !rightExpression) {
      messages.push(makeMessage(
        'Error',
        'Range operator was not given a lower or an upper bound.',
        rangeToken,
      ));
    }

    const start = left || makeIntegerExpression(0, rangeToken);
    const end = rightExpression || makeIntegerExpression(Infinity, rangeToken);

    const identifier = makeCustomIdentifierExpression('..', [rangeToken]);
    return makeFunctionCallExpression(identifier, [start, end], messages, [
      ...left ? left.tokens : [],
      ...rightExpression ? rightExpression.tokens : [],
    ]);
  }
  return undefined;
};
