import { TokenKind } from '../token.model';

export interface TokenTest {
  test: RegExp;
  type: TokenKind;
}

export const whitespacePattern = /^[\s]+/;
export const patterns: TokenTest[] = [
  {
    test: /^{/,
    type: TokenKind.OpenBrace,
  },
  {
    test: /^}/,
    type: TokenKind.CloseBrace,
  },
  {
    test: /^\(/,
    type: TokenKind.OpenParen,
  },
  {
    test: /^\)/,
    type: TokenKind.CloseParen,
  },
  {
    test: /^\[/,
    type: TokenKind.OpenBracket,
  },
  {
    test: /^]/,
    type: TokenKind.CloseBracket,
  },
  {
    test: /^,/,
    type: TokenKind.Comma,
  },
  {
    test: /^:/,
    type: TokenKind.Colon,
  },
  {
    test: /^\+/,
    type: TokenKind.AddOperator,
  },
  {
    test: /^-/,
    type: TokenKind.SubtractOperator,
  },
  {
    test: /^%/,
    type: TokenKind.ModuloOperator,
  },
  {
    test: /^\*/,
    type: TokenKind.MultiplyOperator,
  },
  {
    test: /^\//,
    type: TokenKind.DivideOperator,
  },
  {
    test: /^\*\*/,
    type: TokenKind.PowerOperator,
  },
  {
    test: /^\.\.\./,
    type: TokenKind.SpreadOperator,
  },
  {
    test: /^\.\./,
    type: TokenKind.RangeOperator,
  },
  {
    test: /^=>/,
    type: TokenKind.FatArrow,
  },
  {
    test: /^in/,
    type: TokenKind.InOperator,
  },
  {
    test: /^[_a-zA-Z][_a-zA-Z0-9]*/,
    type: TokenKind.Identifier,
  },
  {
    test: /^[0-9]+(\.[0-9]+)?([eE][0-9]+)?/,
    type: TokenKind.NumericLiteral,
  },
  {
    test: /^('(\\\\|\\'|(?!').)*'?|"(\\\\|\\"|(?!").)*"?)/,
    type: TokenKind.StringLiteral,
  },
];
