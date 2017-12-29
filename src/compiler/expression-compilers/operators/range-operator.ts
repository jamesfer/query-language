import {
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../../../untyped-expression';
import { makeMessage, Message } from '../../../message';
import { Token, TokenKind } from '../../../token';
import { tokenArrayMatches } from '../../../utils';
import { interpretExpression } from '../../interpret-expression';
import {
  makeFunctionCallExpression,
} from '../function/interpret-function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { makeUntypedNoneExpression } from '../../../untyped-expression';
import { hasHigherPrecedence, precedences } from './precedences';
import { first, last } from 'lodash';


export function interpretRangeOperator(tokens: Token[], leftExpression: UntypedExpression | null, prevPrecedence: number): UntypedFunctionCallExpression | undefined {
  const hasPrecedence = hasHigherPrecedence(precedences.range, prevPrecedence);
  if (tokenArrayMatches(tokens, TokenKind.RangeOperator) && hasPrecedence) {
    let rangeToken: Token = tokens[0];
    tokens = tokens.slice(1);

    let start = leftExpression || makeUntypedNoneExpression();
    let end = interpretExpression(tokens, null, precedences.range.precedence);
    if (!end) {
      end = makeUntypedNoneExpression();
    }

    let messages: Message[] = [];
    if (start.kind === 'None' && end.kind === 'None') {
      const beginToken = first(start.tokens) || rangeToken;
      const endToken = last(start.tokens) || rangeToken;
      messages.push(makeMessage(
        'Error',
        'Range operator was not given a lower or an upper bound.',
        beginToken,
        endToken
      ));
    }

    const identifier = makeCustomIdentifierExpression('..', [rangeToken]);
    return makeFunctionCallExpression(identifier, [start, end], messages);
  }
}
