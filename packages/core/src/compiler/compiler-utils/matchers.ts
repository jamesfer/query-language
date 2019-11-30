import { flatten, maxBy } from 'lodash';
import { makeMessage, Message } from '../../message';
import { Token, TokenKind } from '../../token';
import { tokenArrayMatches } from '../../utils';
import { ExpressionInterpreter } from '../interpret-expression';
import { Log, LogValue } from './monoids/log';
import { firstPosition, firstToken, lastToken } from './utils';

export function matchToken(
  tokenKind: TokenKind,
  extraCondition?: (token: Token) => boolean,
): ExpressionInterpreter<{ tokens: [Token] }> {
  return tokens => (
    tokenArrayMatches(tokens, tokenKind) && (!extraCondition || extraCondition(tokens[0]))
      ? Log.of({ tokens: [tokens[0]] })
      : Log.of(undefined)
  );
}

export const matchNothing: ExpressionInterpreter<{ tokens: [] }> = () => {
  return Log.of({ tokens: [] });
};

export function optionallyMatch<T>(
  matcher: ExpressionInterpreter<T>,
  failureMessage?: (tokens: Token[]) => Message,
): ExpressionInterpreter<T> {
  return (tokens, previous, precedence) => {
    const log = Log.empty();
    const result = log.combine(matcher(tokens, previous, precedence));
    if (!result && failureMessage) {
      log.append(failureMessage(tokens));
    }

    return log.wrap(result);
  }
}

export function matchSome<T1 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined] }>;
export function matchSome<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined] }>;
export function matchSome<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined, T3 | undefined] }>;
export function matchSome<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined] }>;
export function matchSome<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }, T5 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>, ExpressionInterpreter<T5>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined, T5 | undefined] }>;
export function matchSome<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }, T5 extends { tokens: Token[] }, T6 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>, ExpressionInterpreter<T5>, ExpressionInterpreter<T6>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined, T5 | undefined, T6 | undefined] }>;
export function matchSome<T extends { tokens: Token[] }>(
  matchers: ExpressionInterpreter<T>[],
): ExpressionInterpreter<{ tokens: Token[], results: (T | undefined)[] }>;
export function matchSome<T extends { tokens: Token[] }>(
  matchers: ExpressionInterpreter<T>[],
): ExpressionInterpreter<{ tokens: Token[], results: (T | undefined)[] }> {
  return (tokens, previous, precedences) => {
    const log = Log.empty();
    let tokenCount = 0;
    const results = matchers.map((matcher) => {
      const newResult = log.combine(matcher(tokens.slice(tokenCount), previous, precedences));
      if (newResult) {
        tokenCount += newResult.tokens.length;
      }

      return newResult;
    });

    return log.wrap(results.every(result => result === undefined) ? undefined : {
      results,
      tokens: flatten(results.map(result => result?.tokens || [])),
    });
  };
}

export function matchAll<T1 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1] }>;
export function matchAll<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1, T2] }>;
export function matchAll<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1, T2, T3] }>;
export function matchAll<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1, T2, T3, T4] }>;
export function matchAll<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }, T5 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>, ExpressionInterpreter<T5>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1, T2, T3, T4, T5] }>;
export function matchAll<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }, T5 extends { tokens: Token[] }, T6 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>, ExpressionInterpreter<T5>, ExpressionInterpreter<T6>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1, T2, T3, T4, T5, T6] }>;
export function matchAll<T extends { tokens: Token[] }>(
  matchers: ExpressionInterpreter<T>[],
): ExpressionInterpreter<{ tokens: Token[], results: T[] }>;
export function matchAll<T extends { tokens: Token[] }>(
  matchers: ExpressionInterpreter<T>[],
): ExpressionInterpreter<{ tokens: Token[], results: T[] }> {
  return (tokens, previous, precedences) => {
    const log = Log.empty();
    let tokenCount = 0;

    const results: T[] = [];
    for (const matcher of matchers) {
      const result = log.combine(matcher(tokens.slice(tokenCount), previous, precedences));
      if (!result) {
        return log.wrap(undefined);
      }

      tokenCount += result.tokens.length;
      results.push(result);
    }

    return log.wrap({
      results,
      tokens: tokens.slice(0, tokenCount),
    });
  };
}

export function matchOneOf<T1 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>],
): ExpressionInterpreter<T1>;
export function matchOneOf<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>],
): ExpressionInterpreter<T1 | T2>;
export function matchOneOf<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>],
): ExpressionInterpreter<T1 | T2 | T3>;
export function matchOneOf<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>],
): ExpressionInterpreter<T1 | T2 | T3 | T4>;
export function matchOneOf<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }, T5 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>, ExpressionInterpreter<T5>],
): ExpressionInterpreter<T1 | T2 | T3 | T4 | T5>;
export function matchOneOf<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }, T5 extends { tokens: Token[] }, T6 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>, ExpressionInterpreter<T5>, ExpressionInterpreter<T6>],
): ExpressionInterpreter<T1 | T2 | T3 | T4 | T5 | T6>;
export function matchOneOf<T extends { tokens: Token[] }>(
  matchers: ExpressionInterpreter<T>[],
): ExpressionInterpreter<T>;
export function matchOneOf<T extends { tokens: Token[] }>(
  matchers: ExpressionInterpreter<T>[],
): ExpressionInterpreter<T> {
  return (tokens, previous, precedences) => {
    const results = matchers.map(matcher => matcher(tokens, previous, precedences));
    return maxBy(results, ({ value }) => value === undefined ? -1 : value.tokens.length)
      || Log.of(undefined);
  };
}

export function matchMultiple<T extends { tokens: Token[] }>(
  matcher: ExpressionInterpreter<T>
): ExpressionInterpreter<{ tokens: Token[], results: T[] }> {
  return (tokens, previous, precedence) => {
    const log = Log.empty();
    const items: T[] = [];
    let tokenIndex = 0;

    while (true) {
      const item = log.combine(matcher(tokens.slice(tokenIndex), previous, precedence));
      if (!item) {
        break;
      }

      items.push(item);
      tokenIndex += item.tokens.length;
    }

    return log.wrap({
      results: items,
      tokens: tokens.slice(0, tokenIndex),
    });
  };
}

export function matchAtLeastOne<T1 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined][] }>;
export function matchAtLeastOne<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined][] }>;
export function matchAtLeastOne<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined, T3 | undefined][] }>;
export function matchAtLeastOne<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined][] }>;
export function matchAtLeastOne<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }, T5 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>, ExpressionInterpreter<T5>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined, T5 | undefined][] }>;
export function matchAtLeastOne<T1 extends { tokens: Token[] }, T2 extends { tokens: Token[] }, T3 extends { tokens: Token[] }, T4 extends { tokens: Token[] }, T5 extends { tokens: Token[] }, T6 extends { tokens: Token[] }>(
  matchers: [ExpressionInterpreter<T1>, ExpressionInterpreter<T2>, ExpressionInterpreter<T3>, ExpressionInterpreter<T4>, ExpressionInterpreter<T5>, ExpressionInterpreter<T6>],
): ExpressionInterpreter<{ tokens: Token[], results: [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined, T5 | undefined, T6 | undefined][] }>;
export function matchAtLeastOne<T extends { tokens: Token[] }>(
  matchers: ExpressionInterpreter<T>[],
): ExpressionInterpreter<{ tokens: Token[], results: (T | undefined)[][] }>;
export function matchAtLeastOne<T extends { tokens: Token[] }>(
  matchers: ExpressionInterpreter<T>[],
): ExpressionInterpreter<{ tokens: Token[], results: (T | undefined)[][] }> {
  return bindInterpreter(
    matchMultiple(
      matchSome<T>(matchers),
    ),
    ({ tokens, results }) => {
      return results.length === 0 ? Log.of(undefined) : Log.of({ tokens, results: results.map(({ results }) => results) });
    },
  );
}

export function bindInterpreter<T, U>(
  interpreter: ExpressionInterpreter<T>,
  f: (value: T) => LogValue<U | undefined>,
): ExpressionInterpreter<U> {
  return (tokens, previous, precedence) => bind(interpreter(tokens, previous, precedence), f);
}

export function bind<T, U>(
  monoid: LogValue<T | undefined>,
  f: (value: T) => LogValue<U | undefined>,
): LogValue<U | undefined> {
  const log = Log.empty();
  const value = log.combine(monoid);
  if (value === undefined) {
    return log.wrap(undefined);
  }
  const result = log.combine(f(value));
  return log.wrap(result);
}

interface MatchListResult<O, T, S, C> {
  opener: O;
  items: T[];
  separators: S[];
  closer: C | undefined;
  tokens: Token[];
}

export function matchList<O extends { tokens: Token[] }, T extends { tokens: Token[] }, S extends { tokens: Token[] }, C extends { tokens: Token[] }>(
  openerInterpreter: ExpressionInterpreter<O>,
  itemInterpreter: ExpressionInterpreter<T>,
  separatorInterpreter: ExpressionInterpreter<S>,
  closerInterpreter: ExpressionInterpreter<C>,
  missingSeparatorMessage: string,
  missingItemMessage: string,
  missingCloserMessage: string,
  emptyListMessage?: string,
): ExpressionInterpreter<MatchListResult<O, T, S, C>> {
  return (tokens, previous, precedence): LogValue<MatchListResult<O, T, S, C> | undefined> => {
    const log = Log.empty();
    let tokenIndex = 0;
    let lastItem: undefined | 'separator' | 'item' = undefined;

    let items: T[] = [];
    let separators: S[] = [];
    let closer: undefined | C;

    const opener = log.combine(openerInterpreter(tokens, previous, precedence));
    if (opener) {
      tokenIndex += opener.tokens.length;

      while (true) {
        const itemTokens = tokens.slice(tokenIndex);
        const item = log.combine(itemInterpreter(itemTokens, previous, precedence));
        if (lastItem === 'item') {
          const token = firstToken(itemTokens);
          if (token) {
            log.push(makeMessage('Error', missingSeparatorMessage, token));
          }
        }
        if (item) {
          tokenIndex += item.tokens.length;
          items.push(item);
          lastItem = 'item';
        }

        const separatorTokens = tokens.slice(tokenIndex);
        const separator = log.combine(separatorInterpreter(separatorTokens, previous, precedence));
        if (lastItem === 'separator') {
          const token = firstToken(separatorTokens);
          if (token) {
            log.push(makeMessage('Error', missingItemMessage, token));
          }
        }
        if (separator) {
          tokenIndex += separator.tokens.length;
          separators.push(separator);
          lastItem = 'separator';
        }

        closer = log.combine(closerInterpreter(tokens.slice(tokenIndex), previous, precedence));
        if (closer) {
          tokenIndex += closer.tokens.length;
          break;
        }

        if (!item && !separator) {
          const token = firstToken(itemTokens);
          if (token) {
            log.push(makeMessage('Error', missingCloserMessage, token));
          }
          break;
        }
      }

      if (emptyListMessage && items.length === 0 && closer) {
        const startToken = firstToken(opener.tokens);
        const endToken = lastToken(closer.tokens);
        if (startToken && endToken) {
          log.push(makeMessage('Error', emptyListMessage, startToken, endToken));
        }
      }

      return log.wrap({
        opener,
        items,
        separators,
        closer,
        tokens: tokens.slice(0, tokenIndex),
      });
    }

    return log.wrap(undefined);
  };
}

export function matchSeparatedList<T extends { tokens: Token[] }, S extends { tokens: Token[] }>(
  itemInterpreter: ExpressionInterpreter<T>,
  separatorInterpreter: ExpressionInterpreter<S>,
  missingSeparatorMessage: string,
  missingItemMessage: string,
): ExpressionInterpreter<{ tokens: Token[], items: T[] }> {
  return bindInterpreter(
    matchMultiple(matchSome([
      itemInterpreter,
      separatorInterpreter,
    ])),
    ({ results, tokens }) => {
      const log = Log.empty();
      const items: T[] = [];
      let tokenIndex = 0;
      results.forEach(({ results: [item, separator] }, index) => {
        if (!item) {
          log.push(makeMessage('Error', missingItemMessage, firstPosition(tokens.slice(tokenIndex))));
        } else {
          items.push(item);
          tokenIndex += item.tokens.length;
        }

        if (!separator) {
          if (index !== results.length - 1) {
            log.push(makeMessage('Error', missingSeparatorMessage, firstPosition(tokens.slice(tokenIndex))));
          }
        } else {
          tokenIndex += separator.tokens.length;
        }
      });

      return log.wrap({ tokens, items });
    },
  );
}

export function assignType<T>(type: T): <E>(interpreter: ExpressionInterpreter<E>) => ExpressionInterpreter<E & { type: T }> {
  return interpreter => bindInterpreter(interpreter, result => Log.of({ ...result, type }));
}
