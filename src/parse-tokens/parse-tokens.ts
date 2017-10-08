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
  let messages: Message[] = [];
  let startIndex = 0;
  let remaining = code.substr(startIndex);
  let unrecognisedCharacters = '';

  while (remaining.length) {
    // Skip any white space
    let whitespace = remaining.match(whitespacePattern);
    if (whitespace && whitespace.length) {
      remaining = remaining.slice(whitespace[0].length);
      startIndex += whitespace[0].length;
      continue;
    }

    // Parse a token an attempt to detect unrecognised tokens
    let nextToken = parseNextToken(remaining);
    while (!nextToken) {
      unrecognisedCharacters += remaining[0];
      remaining = remaining.substr(1);
      nextToken = parseNextToken(remaining);
    }
    if (unrecognisedCharacters.length) {
      messages.push(makeMessage('Error', 'Unrecognised token ' + unrecognisedCharacters + '.'));
      startIndex += unrecognisedCharacters.length;
      unrecognisedCharacters = '';
      continue;
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
    messages,
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

