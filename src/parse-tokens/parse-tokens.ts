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
  let remaining = code;

  while (remaining.length) {
    remaining = skipWhitespace(remaining);

    let result = nextToken(remaining, code.length - remaining.length);
    if (result.token) {
      tokens.push(result.token);
    }
    messages = messages.concat(result.messages);
    remaining = remaining.substr(result.skip);
  }

  return {
    tokens,
    messages,
  };
}

function skipWhitespace(code: string): string {
  let whitespace = code.match(whitespacePattern);
  if (whitespace && whitespace.length) {
    return code.slice(whitespace[0].length);
  }
  return code;
}

function nextToken(code: string, pos: number): { token: Token | null, messages: Message[], skip: number } {
  let unrecognisedCharacters = '';
  let messages: Message[] = [];

  // Collect unrecognized characters until a token is found or the string ends
  let token = parseNextToken(code, pos);
  while (!token && code.length) {
    unrecognisedCharacters += code[0];
    code = code.substr(1);
    token = parseNextToken(code, pos + unrecognisedCharacters.length);
  }

  if (unrecognisedCharacters.length) {
    messages.push(makeMessage('Error', 'Unrecognised token ' + unrecognisedCharacters));
  }

  return {
    token,
    messages,
    skip: unrecognisedCharacters.length + tokenLength(token),
  };
}

function parseNextToken(code: string, pos: number): Token | null {
  for (let tokenTest of patterns) {
    let matches = code.match(tokenTest.test);
    if (matches !== null) {
      return {
        kind: tokenTest.type,
        value: matches[0],
        begin: pos + (matches.index || 0),
        end: pos + (matches.index || 0) + matches[0].length,
      };
    }
  }
  return null;
}

function tokenLength(token: Token | null): number {
  return token ? token.end - token.begin : 0
}

