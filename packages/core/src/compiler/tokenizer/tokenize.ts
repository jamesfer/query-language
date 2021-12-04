import { compile, Lexer, Token as MooToken } from 'moo';
import { Position } from '../../position';
import { Token, TokenKind } from '../../token';
import rules from './rules';

function shouldSkipToken({ type }: MooToken): boolean {
  return type === TokenKind.WhiteSpace || type === TokenKind.Comment;
}

/**
 * Moo doesn't count carriage returns in new lines so we need to convert all of them to just \n
 */
function normalizeLineEndings(code: string): string {
  return code.replace(/(\n\r|\r)/g, '\n');
}

function positionOf(
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

export function createLexer(): Lexer {
  return compile(rules);
}

export function nextToken(lexer: Lexer): Token | undefined {
  const nextToken = lexer.next();
  return nextToken ? convertToken(nextToken) : undefined;
}

function eatTokens(code: string): Token[] {
  const lexer = createLexer();
  lexer.reset(code);

  const tokens = [];
  let token = nextToken(lexer);
  while (token) {
    tokens.push(token);
  }

  return tokens;
}

// TODO add messages (maybe)
// TODO add some way to check for failure. Currently the next function throws an error when an
//      unknown token is encountered
export default function tokenize(code: string): Token[] {
  return eatTokens(normalizeLineEndings(code));
}
