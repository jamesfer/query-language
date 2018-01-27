import { UntypedExpression } from '../../untyped-expression';
import { makeMessage, Message } from '../../message';
import { Token, TokenKind } from '../../token';
import { tokenArrayMatches } from '../../utils';
import { interpretExpression } from '../interpret-expression';
import { last, first } from 'lodash';
import { MessageResult, MessageStore } from './message-store';

function consumeElementAndSep(sepToken: TokenKind, tokens: Token[]): { expression: UntypedExpression | null, sep: Token | null } {
  let expression = interpretExpression(tokens);
  if (expression) {
    tokens = tokens.slice(expression.tokens.length);
  }

  let sep: Token | null = null;
  if (tokenArrayMatches(tokens, sepToken)) {
    sep = tokens[0];
  }

  return { expression, sep };
}

function consumeList(closeToken: TokenKind, sepToken: TokenKind, tokens: Token[]): MessageResult<{ expressions: UntypedExpression[], tokens: Token[] }> {
  let messageStore = new MessageStore();
  let expressions: UntypedExpression[] = [];
  let usedTokens: Token[] = [];

  while (tokens.length && !tokenArrayMatches(tokens, closeToken)) {
    let { expression, sep } = consumeElementAndSep(sepToken, tokens);

    if (expression) {
      expressions.push(expression);
      tokens = tokens.slice(expression.tokens.length);
      usedTokens = usedTokens.concat(expression.tokens);

      if (!sep && !tokenArrayMatches(tokens, closeToken) && tokens.length) {
        const lastToken = last(usedTokens);
        const nextToken = tokens[0];
        messageStore.add(makeMessage(
          'Error',
          'Missing separator between items',
          lastToken ? lastToken.end : nextToken.begin,
          nextToken.begin,
        ));
      }
    }
    if (sep) {
      usedTokens.push(tokens[0]);
      tokens = tokens.slice(1);

      if (!expression) {
        messageStore.add(makeMessage(
          'Error',
          'Unneeded separator between items',
          sep,
        ));
      }
    }

    // Exit the loop to prevent infinite loops when no tokens are consumed
    // from the input
    if (!sep && !expression) {
      break;
    }
  }

  return messageStore.makeResult({
    expressions,
    tokens: usedTokens,
  })
}

export function buildListInterpreter(openToken: TokenKind, closeToken: TokenKind, sepToken: TokenKind, maxItems: number = -1)
: (tokens: Token[]) => MessageResult<{ expressions: UntypedExpression[], tokens: Token[] }> | undefined {
  return tokens => {
    if (tokenArrayMatches(tokens, openToken)) {
      const messageStore = new MessageStore();
      let openingToken = tokens[0];
      tokens = tokens.slice(1);

      const list = messageStore.store(consumeList(closeToken, sepToken, tokens));
      tokens = tokens.slice(list.tokens.length);
      list.tokens = [openingToken, ...list.tokens];

      if (tokenArrayMatches(tokens, closeToken)) {
        list.tokens.push(tokens[0]);
      }
      else {
        const lastToken = last(list.tokens) || openingToken;
        messageStore.add(makeMessage(
          'Error',
          'Missing closing token',
          lastToken
        ));
      }

      if (maxItems !== -1 && list.expressions.length > maxItems) {
        const firstExcessiveToken = first(list.expressions[maxItems].tokens);
        const lastToken = last(list.tokens) || openingToken;
        messageStore.add(makeMessage(
          'Error',
          'Too many elements',
          firstExcessiveToken || openingToken,
          lastToken || openingToken,
        ));
      }

      return messageStore.makeResult(list);
    }
  }
}
