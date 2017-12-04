import {
  Expression,
  UntypedFunctionCallExpression,
} from '../../../../untyped-expression.model';
import { makeMessage, Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';
import { buildExpression } from '../../interpret-expression';
import {
  makeFunctionCallExpression,
} from '../function-call';
import { makeCustomIdentifierExpression } from '../identifier';
import { makeUntypedNoneExpression } from '../../../../untyped-expression.model';

const RangePrecedence = 6;

export function buildRangeOperatorExpression(tokens: Token[], leftExpression: Expression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.RangeOperator) && operatorPrecedence < RangePrecedence) {
    let rangeToken: Token = tokens[0];
    tokens = tokens.slice(1);

    let start = leftExpression || makeUntypedNoneExpression();
    let end = buildExpression(tokens, null, RangePrecedence) || makeUntypedNoneExpression();

    let messages: Message[] = [];
    if (start.kind === 'NoneLiteral' && end.kind === 'NoneLiteral') {
      messages.push(makeMessage('Error', 'Range operator was not given a lower or an upper bound.'));
    }

    const identifier = makeCustomIdentifierExpression('..', [rangeToken]);
    return makeFunctionCallExpression(identifier, [start, end], messages);
  }
}



