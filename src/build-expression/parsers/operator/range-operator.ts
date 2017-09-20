import { Token, TokenKind } from '../../../token.model';
import { FunctionCallExpression, makeFunctionCallExpression } from '../function-call';
import { Expression } from '../../../expression.model';
import { tokenArrayMatches } from '../../../utils';
import { makeCustomIdentifierExpression } from '../identifier';
import { buildExpression } from '../../build-expression';
import { makeNoneExpression } from '../none';
import { makeMessage, Message } from '../../../message.model';

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
    return makeFunctionCallExpression(identifier, [start, end], [], messages);
  }
}



