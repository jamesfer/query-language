import { Expression } from '../../../../expression.model';
import { makeMessage, Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';
import { buildExpression } from '../../interpret-expression';
import {
  FunctionCallExpression,
  makeFunctionCallExpression,
} from '../function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { makeNoneExpression } from '../none';

const RangePrecedence = 6;

export function buildRangeOperatorExpression(tokens: Token[], leftExpression: Expression | null, operatorPrecedence: number): FunctionCallExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.RangeOperator) && operatorPrecedence < RangePrecedence) {
    let rangeToken: Token = tokens[0];
    tokens = tokens.slice(1);

    let start = leftExpression || makeNoneExpression();
    let end = buildExpression(tokens, null, RangePrecedence) || makeNoneExpression();

    let messages: Message[] = [];
    if (start.kind === 'NoneLiteral' && end.kind === 'NoneLiteral') {
      messages.push(makeMessage('Error', 'Range operator was not given a lower or an upper bound.'));
    }

    const identifier = makeCustomIdentifierExpression('..', [rangeToken]);
    return makeFunctionCallExpression(identifier, [start, end], messages);
  }
}



