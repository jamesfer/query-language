import {
  UntypedArrayLiteralExpression,
  Expression,
} from '../../../../untyped-expression.model';
import { Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { buildList } from '../util/list';

function makeArrayLiteralExpression(elements: Expression[], tokens: Token[] = [], messages: Message[] = []) : UntypedArrayLiteralExpression {
  return {
    kind: 'ArrayLiteral',
    elements,
    tokens,
    messages,
  }
}

let buildArrayList = buildList(TokenKind.OpenBracket, TokenKind.CloseBracket, TokenKind.Comma);

export function buildArrayLiteralExpression(tokens: Token[]): UntypedArrayLiteralExpression | undefined {
  let list = buildArrayList(tokens);
  if (list) {
    return makeArrayLiteralExpression(list.expressions, list.tokens, list.messages);
  }
}
