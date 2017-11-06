import { Expression } from '../../../../expression.model';
import { makeMessage, Message } from '../../../../message.model';
import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';
import { buildExpression } from '../../interpret-expression';

function consumeElementAndSep(sepToken: TokenKind, tokens: Token[]): { expression: Expression | null, sep: Token | null } {
  let expression = buildExpression(tokens);
  if (expression) {
    tokens = tokens.slice(expression.tokens.length);
  }

  let sep: Token | null = null;
  if (tokenArrayMatches(tokens, sepToken)) {
    sep = tokens[0];
  }

  return { expression, sep };
}

function consumeList(closeToken: TokenKind, sepToken: TokenKind, tokens: Token[]): { expressions: Expression[], tokens: Token[], messages: Message[] } {
  let messages: Message[] = [];
  let expressions: Expression[] = [];
  let usedTokens: Token[] = [];

  while (tokens.length && !tokenArrayMatches(tokens, closeToken)) {
    let { expression, sep } = consumeElementAndSep(sepToken, tokens);

    if (expression) {
      expressions.push(expression);
      tokens = tokens.slice(expression.tokens.length);
      usedTokens = usedTokens.concat(expression.tokens);

      if (!sep && !tokenArrayMatches(tokens, closeToken)) {
        messages.push(makeMessage('Error', 'Missing separator between items'));
      }
    }
    if (sep) {
      usedTokens.push(tokens[0]);
      tokens = tokens.slice(1);

      if (!expression) {
        messages.push(makeMessage('Error', 'Unneeded separator between items'));
      }
    }

    // Exit the loop to prevent infinite loops when no tokens are consumed
    // from the input
    if (!sep && !expression) {
      break;
    }
  }

  return {
    messages,
    expressions,
    tokens: usedTokens,
  }
}

export function buildList(openToken: TokenKind, closeToken: TokenKind, sepToken: TokenKind, maxItems: number = -1)
: (tokens: Token[]) => { expressions: Expression[], tokens: Token[], messages: Message[] } | undefined {
  return tokens => {
    if (tokenArrayMatches(tokens, openToken)) {
      let openingToken = tokens[0];
      tokens = tokens.slice(1);

      let list = consumeList(closeToken, sepToken, tokens);
      tokens = tokens.slice(list.tokens.length);
      list.tokens = [openingToken, ...list.tokens];

      if (tokenArrayMatches(tokens, closeToken)) {
        list.tokens.push(tokens[0]);
      }
      else {
        list.messages.push(makeMessage('Error', 'Missing closing token'));
      }

      if (maxItems !== -1 && list.expressions.length > maxItems) {
        list.messages.push(makeMessage('Error', 'Too many elements'));
      }

      return list;
    }
  }
}
