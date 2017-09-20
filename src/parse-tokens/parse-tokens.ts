import { Token } from '../token.model';
import { patterns, whitespacePattern } from './token-patterns';
import { makeMessage, Message } from '../message.model';

export interface TokenList {
  tokens: Token[],
  messages: Message[],
  failed?: boolean,
}

export function parseTokens(code: string): TokenList {
  let tokens: Token[] = [];
  let startIndex = 0;
  let remaining = code.substr(startIndex);

  while (remaining.length) {
    // Skip any white space
    let whitespace = remaining.match(whitespacePattern);
    if (whitespace && whitespace.length) {
      remaining = remaining.slice(whitespace[0].length);
      startIndex += whitespace[0].length;
      continue;
    }

    let nextToken = parseNextToken(remaining);
    if (!nextToken) {
      return {
        tokens,
        messages: [makeMessage('Error', 'Failed to parse the token at position ' + startIndex + '.')],
        failed: true,
      }
    }

    // Remove the matched part of the token
    remaining = remaining.substr(nextToken.end);

    // Make the begin and end relative to the original code string
    nextToken.begin += startIndex;
    nextToken.end += startIndex;
    startIndex = nextToken.end;

    tokens.push(nextToken);
  }

  return {
    tokens,
    messages: [],
  };
}

function parseNextToken(code: string): Token | null {
  for (let tokenTest of patterns) {
    let matches = code.match(tokenTest.test);
    if (matches !== null) {
      return {
        kind: tokenTest.type,
        value: matches[0],
        begin: matches.index || 0,
        end: (matches.index || 0) + matches[0].length,
      };
    }
  }
  return null;
}

