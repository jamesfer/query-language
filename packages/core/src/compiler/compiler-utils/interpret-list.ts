import { UntypedExpression } from '../../untyped-expression';
import { makeMessage } from '../../message';
import { Token, TokenKind } from '../../token';
import { tokenArrayMatches } from '../../utils';
import { interpretExpression } from '../interpret-expression';
import { first, last } from 'lodash';
import { LogValue, Log } from './monoids/log';

function consumeElementAndSep(
  sepToken: TokenKind,
  incomingTokens: Token[],
): LogValue<{ expression: UntypedExpression | undefined, sep: Token | null }> {
  let tokens = incomingTokens;
  const log = Log.empty();
  const expression = log.combine(interpretExpression(tokens));
  if (expression) {
    tokens = tokens.slice(expression.tokens.length);
  }

  let sep: Token | null = null;
  if (tokenArrayMatches(tokens, sepToken)) {
    sep = tokens[0];
  }

  return log.wrap({ expression, sep });
}

function consumeList(
  closeToken: TokenKind,
  sepToken: TokenKind,
  incomingTokens: Token[],
): LogValue<{ expressions: UntypedExpression[], tokens: Token[] }> {
  let tokens = incomingTokens;
  const log = Log.empty();
  const expressions: UntypedExpression[] = [];
  let usedTokens: Token[] = [];

  while (tokens.length && !tokenArrayMatches(tokens, closeToken)) {
    const { expression, sep } = log.combine(consumeElementAndSep(sepToken, tokens));
    if (expression) {
      expressions.push(expression);
      tokens = tokens.slice(expression.tokens.length);
      usedTokens = usedTokens.concat(expression.tokens);

      if (!sep && !tokenArrayMatches(tokens, closeToken) && tokens.length) {
        const lastToken = last(usedTokens);
        const nextToken = tokens[0];
        log.push(makeMessage(
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
        log.push(makeMessage(
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

  return log.wrap({ expressions, tokens: usedTokens });
}

export type ListInterpreter = (tokens: Token[])
  => LogValue<{ expressions: UntypedExpression[], tokens: Token[] } | undefined>;

export function buildListInterpreter(
  openToken: TokenKind,
  closeToken: TokenKind,
  sepToken: TokenKind,
  maxItems: number = -1,
): ListInterpreter {
  return (incomingTokens) => {
    let tokens = incomingTokens;
    if (tokenArrayMatches(tokens, openToken)) {
      const log = Log.empty();
      const openingToken = tokens[0];
      tokens = tokens.slice(1);

      const list = log.combine(consumeList(closeToken, sepToken, tokens));
      tokens = tokens.slice(list.tokens.length);
      list.tokens = [openingToken, ...list.tokens];

      if (tokenArrayMatches(tokens, closeToken)) {
        list.tokens.push(tokens[0]);
      } else {
        const lastToken = last(list.tokens) || openingToken;
        log.push(makeMessage('Error', 'Missing closing token', lastToken));
      }

      if (maxItems !== -1 && list.expressions.length > maxItems) {
        const firstExcessiveToken = first(list.expressions[maxItems].tokens);
        const lastToken = last(list.tokens) || openingToken;
        log.push(makeMessage(
          'Error',
          'Too many elements',
          firstExcessiveToken || openingToken,
          lastToken || openingToken,
        ));
      }

      return log.wrap(list);
    }
    return Log.of(undefined);
  };
}
