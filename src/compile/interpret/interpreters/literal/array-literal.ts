import { Expression, ExpressionInterface } from '../../../../expression.model';
import { Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { buildList } from '../util/list';

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
