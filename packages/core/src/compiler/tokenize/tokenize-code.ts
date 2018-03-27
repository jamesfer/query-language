import { makeMessage, Message } from '../../message';
import { Position, Token, TokenKind } from '../../token';
import { patterns, whitespacePattern } from './token-patterns';
import { includes } from 'lodash';

const ignoredTokens = [TokenKind.Comment];

export interface TokenList {
  tokens: Token[];
  messages: Message[];
  failed?: boolean;
}

function calculatePosition(code: string): Position {
  const matches = code.match(/\r?\n/);
  if (matches && matches.length) {
    const lastMatch = matches[matches.length - 1];
    const lastIndex = code.lastIndexOf(lastMatch) + lastMatch.length;
    return [matches.length, code.length - lastIndex];
  }
  return [0, code.length];
}

function skipWhitespace(code: string): { code: string, position: Position, length: number } {
  const whitespace = code.match(whitespacePattern);
  if (whitespace && whitespace.length) {
    const length = whitespace[0].length;
    return {
      length,
      code: code.slice(length),
      position: calculatePosition(whitespace[0]),
    };
  }
  return {
    code,
    position: [0, 0],
    length: 0,
  };
}

export function addPositions(pos1: Position, pos2Offset: Position | number): Position {
  let pos2 = pos2Offset;
  if (typeof pos2 === 'number') {
    pos2 = [0, pos2];
  }

  return [
    pos1[0] + pos2[0],
    pos2[1] + (pos2[0] === 0 ? pos1[1] : 0),
  ];
}

function parseNextToken(code: string, pos: Position): Token | null {
  for (const tokenTest of patterns) {
    const matches = code.match(tokenTest.test);
    if (matches !== null) {
      const offset = matches.index || 0;
      return {
        kind: tokenTest.type,
        value: matches[0],
        begin: addPositions(pos, offset),
        end: addPositions(pos, offset + matches[0].length),
      };
    }
  }
  return null;
}

// function tokenLength(token: Token | null): number {
//   return token ? token.end - token.begin : 0;
// }

function nextToken(code: string, position: Position): { token: Token | null, skip: number } {
  // let unrecognisedCharacters = '';
  // let messages: Message[] = [];

  // Skip any whitespace
  const { length, code: strippedCode, position: strippedPosition } = skipWhitespace(code);

  // Collect unrecognized characters until a token is found or the string ends
  const token = parseNextToken(strippedCode, strippedPosition);
  // while (!token && code.length) {
  //   unrecognisedCharacters += code[0];
  //   pos.position += 1;
  //   code = code.substr(1);
  //   token = parseNextToken(code, pos + unrecognisedCharacters.length);
  // }

  // if (unrecognisedCharacters.length) {
  //   messages.push(makeMessage('Error', 'Unrecognised token ' + unrecognisedCharacters));
  // }

  return {
    token,
    skip: length + (token ? token.value.length : 0),
  };
  // return {
  //   token,
    // messages,
    // skip: unrecognisedCharacters.length + tokenLength(token),
  // };
}

export function tokenizeCode(code: string): TokenList {
  let unrecognisedCharacters = '';
  const messages: Message[] = [];
  const tokens: Token[] = [];
  let remaining = code;
  let position: Position = [0, 0];

  // Collect unrecognized characters until a token is found or the string ends
  // let token = parseNextToken(code, pos);
  // while (!token && code.length) {
  //   unrecognisedCharacters += code[0];
  //   pos.position += 1;
  //   code = code.substr(1);
  //   token = parseNextToken(code, pos + unrecognisedCharacters.length);
  // }

  while (remaining.length) {
    // Parse the next token
    const result = nextToken(remaining, position);
    if (result.token) {
      // Check if there was an unrecognised token
      if (unrecognisedCharacters.length) {
        const unknownPosition: Position = [
          position[0] - unrecognisedCharacters.length,
          position[1],
        ];
        const message = 'Unrecognised token ' + unrecognisedCharacters;
        messages.push(makeMessage('Error', message, unknownPosition));
        unrecognisedCharacters = '';
      }

      // Save the token found if it is not ignored
      if (!includes(ignoredTokens, result.token.kind)) {
        tokens.push(result.token);
      }
      remaining = remaining.substr(result.skip);
      position = result.token.end;
    } else {
      unrecognisedCharacters += remaining[0];
      position[1] += 1;
      remaining = remaining.slice(1);
    }
  }

  return {
    tokens,
    messages,
  };
}

// function nextToken(code: string, pos: Position)
// : { token: Token | null, messages: Message[], skip: number } {
//   let unrecognisedCharacters = '';
//   let unrecognisedPosition = { line: 0, column: 0 };
//   let messages: Message[] = [];
//
//   // Collect unrecognized characters until a token is found or the string ends
//   let token = parseNextToken(code, pos);
//   while (!token && code.length) {
//     unrecognisedCharacters += code[0];
//     pos.position += 1;
//     code = code.substr(1);
//     token = parseNextToken(code, pos + unrecognisedCharacters.length);
//   }
//
//   if (unrecognisedCharacters.length) {
//     messages.push(makeMessage('Error', 'Unrecognised token ' + unrecognisedCharacters));
//   }
//
//   return {
//     token,
//     messages,
//     skip: unrecognisedCharacters.length + tokenLength(token),
//   };
// }
//
// export function parseTokens(code: string): TokenList {
//   let tokens: Token[] = [];
//   let messages: Message[] = [];
//   let remaining = code;
//   let line = 1;
//
//   while (remaining.length) {
//     let whitespace = skipWhitespace(remaining);
//     remaining = whitespace.code;
//     line += countNewLines(whitespace.skipped);
//
//     const position = code.length - remaining.length;
//     let result = nextToken(remaining, { line, position });
//     if (result.token) {
//       tokens.push(result.token);
//     }
//     messages = messages.concat(result.messages);
//     remaining = remaining.substr(result.skip);
//   }
//
//   return {
//     tokens,
//     messages,
//   };
// }
