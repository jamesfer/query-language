import { makeMessage, Message } from '../../message';
import { Token, Position, TokenKind } from '../../token';
import { patterns, whitespacePattern } from './token-patterns';
import { includes } from 'lodash';

const ignoredTokens = [ TokenKind.Comment ];

export interface TokenList {
  tokens: Token[],
  messages: Message[],
  failed?: boolean,
}

function calculatePosition(code: string): Position {
  let matches = code.match(/\r?\n/);
  if (matches && matches.length) {
    let lastMatch = matches[matches.length - 1];
    let lastIndex = code.lastIndexOf(lastMatch) + lastMatch.length;
    return [ matches.length, code.length - lastIndex ];
  }
  return [ 0, code.length ];
}

function skipWhitespace(code: string): { code: string, position: Position, length: number } {
  let whitespace = code.match(whitespacePattern);
  if (whitespace && whitespace.length) {
    const length = whitespace[0].length;
    return {
      code: code.slice(length),
      position: calculatePosition(whitespace[0]),
      length,
    };
  }
  return {
    code,
    position: [ 0, 0 ],
    length: 0,
  };
}

export function addPositions(pos1: Position, pos2: Position | number): Position {
  if (typeof pos2 === 'number') {
    pos2 = [ 0, pos2 ];
  }
  return [
    pos1[0] + pos2[0],
    pos2[1] + (pos2[0] === 0 ? pos1[1] : 0),
  ];
}

function parseNextToken(code: string, pos: Position): Token | null {
  for (let tokenTest of patterns) {
    let matches = code.match(tokenTest.test);
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
  let whitespace = skipWhitespace(code);
  code = whitespace.code;
  position = addPositions(position, whitespace.position);

  // Collect unrecognized characters until a token is found or the string ends
  let token = parseNextToken(code, position);
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
    skip: whitespace.length + (token ? token.value.length : 0),
  };
  // return {
  //   token,
    // messages,
    // skip: unrecognisedCharacters.length + tokenLength(token),
  // };
}

export function tokenizeCode(code: string): TokenList {
  let unrecognisedCharacters = '';
  let messages: Message[] = [];
  let tokens: Token[] = [];
  let remaining = code;
  let position: Position = [ 0, 0 ];

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
    let result = nextToken(remaining, position);
    if (result.token) {
      // Check if there was an unrecognised token
      if (unrecognisedCharacters.length) {
        const unknownPosition: Position = [
          position[0] - unrecognisedCharacters.length,
          position[1],
        ];
        messages.push(makeMessage('Error', 'Unrecognised token ' + unrecognisedCharacters, unknownPosition));
        unrecognisedCharacters = '';
      }

      // Save the token found if it is not ignored
      if (!includes(ignoredTokens, result.token.kind)) {
        tokens.push(result.token);
      }
      remaining = remaining.substr(result.skip);
      position = result.token.end;
    }
    else {
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

// function nextToken(code: string, pos: Position): { token: Token | null, messages: Message[], skip: number } {
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
