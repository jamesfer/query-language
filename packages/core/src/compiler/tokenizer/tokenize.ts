import { Token as MooToken } from 'moo';
import { makeLexer } from './make-lexer';
import { Token, TokenKind } from '../../token';
import { Position } from '../../position';

export function positionOf(
  { value, lineBreaks, col, line }: MooToken,
): { begin: Position, end: Position } {
  const endCol = lineBreaks === 0
    ? col - 1 + value.length
    : value.length - value.lastIndexOf('\n');
  // Moo indexes col and line from 1
  return {
    begin: [line - 1, col - 1],
    end: [line - 1 + lineBreaks, endCol],
  };
}

function convertToken(token: MooToken): Token {
  const { begin, end } = positionOf(token);
  const { type, value } = token;
  return {
    value,
    begin,
    end,
    kind: type as TokenKind,
  };
}

// TODO add messages (maybe)
// TODO add some way to check for failure
export function tokenize(code: string): Token[] {
  const lexer = makeLexer();
  lexer.reset(code);

  const tokens = [];
  let nextToken = lexer.next();
  while (nextToken !== undefined) {
    tokens.push(convertToken(nextToken));
    nextToken = lexer.next();
  }

  return tokens;
}
