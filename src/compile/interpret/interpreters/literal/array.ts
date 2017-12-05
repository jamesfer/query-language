import {
  UntypedArrayExpression,
  UntypedExpression,
} from '../../../../untyped-expression.model';
import { Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { buildList } from '../util/list';

function makeArrayExpression(elements: UntypedExpression[], tokens: Token[] = [], messages: Message[] = []) : UntypedArrayExpression {
  return {
    kind: 'Array',
    elements,
    tokens,
    messages,
  }
}

let buildArrayList = buildList(TokenKind.OpenBracket, TokenKind.CloseBracket, TokenKind.Comma);

export function buildArrayExpression(tokens: Token[]): UntypedArrayExpression | undefined {
  let list = buildArrayList(tokens);
  if (list) {
    return makeArrayExpression(list.expressions, list.tokens, list.messages);
  }
}
