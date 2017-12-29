import { TokenKind } from '../../token';

export interface TokenTest {
  test: RegExp;
  type: TokenKind;
}

export const whitespacePattern = /^[\s]+/;
export const patterns: TokenTest[] = [
  {
    test: /^--[^\n\r]*/,
    type: TokenKind.Comment
  },
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
    test: /^&/,
    type: TokenKind.ComposeOperator,
  },
  {
    test: /^\*\*/,
    type: TokenKind.PowerOperator,
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
    test: /^<=/,
    type: TokenKind.LessEqual,
  },
  {
    test: /^</,
    type: TokenKind.LessThan,
  },
  {
    test: /^>=/,
    type: TokenKind.GreaterEqual,
  },
  {
    test: /^>/,
    type: TokenKind.GreaterThan,
  },
  {
    test: /^!=/,
    type: TokenKind.NotEqual,
  },
  {
    test: /^=/,
    type: TokenKind.Equal,
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
    test: /^(true|false)/,
    type: TokenKind.BooleanLiteral,
  },
  {
    test: /^[_a-zA-Z][_a-zA-Z0-9]*/,
    type: TokenKind.Identifier,
  },
  {
    test: /^[0-9]+((\.[0-9]*)?[eE]-?[0-9]+|\.[0-9]*)(?!\.)/,
    type: TokenKind.FloatLiteral,
  },
  {
    test: /^[0-9]+/,
    type: TokenKind.IntegerLiteral,
  },
  {
    test: /^('(\\\\|\\'|(?!').)*'?|"(\\\\|\\"|(?!").)*"?)/,
    type: TokenKind.StringLiteral,
  },
];
