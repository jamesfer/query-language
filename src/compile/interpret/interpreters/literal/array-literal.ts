import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';
import { Expression, ExpressionInterface } from '../../../../expression.model';
import { buildExpression } from '../../interpret-expression';
import { sortBy, sum, map } from 'lodash';
import { makeMessage, Message } from '../../../../message.model';
import { buildList } from '../util/list';
import { interleaveTokens } from '../util/interleave-tokens';

export interface ArrayLiteralExpression extends ExpressionInterface<'ArrayLiteral'> {
  elements: Expression[];
}

function makeArrayLiteralExpression(elements: Expression[], tokens: Token[] = [], messages: Message[] = []) : ArrayLiteralExpression {
  return {
    kind: 'ArrayLiteral',
    elements,
    tokens,
    messages,
  }
}

let buildArrayList = buildList(TokenKind.OpenBracket, TokenKind.CloseBracket, TokenKind.Comma);

export function buildArrayLiteralExpression(tokens: Token[]): ArrayLiteralExpression | undefined {
  let list = buildArrayList(tokens);
  if (list) {
    return makeArrayLiteralExpression(list.expressions, list.tokens, list.messages);
  }
}
