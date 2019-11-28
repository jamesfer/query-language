import { Position } from '../../position';
import { Token, TokenKind } from '../../token';
import tokenize from './tokenize';

function tokenOf(kind: TokenKind, value: string, begin: Position = [0, 0]): Token {
  return {
    kind,
    value,
    begin,
    end: [begin[0], begin[1] + value.length],
  };
}

describe('tokenize', () => {
  it.each<[string, TokenKind]>([
    ['{', TokenKind.OpenBrace],
    ['}', TokenKind.CloseBrace],
    ['(', TokenKind.OpenParen],
    [')', TokenKind.CloseParen],
    ['[', TokenKind.OpenBracket],
    [']', TokenKind.CloseBracket],
    [',', TokenKind.Comma],
    [':', TokenKind.Colon],
    ['|', TokenKind.Pipe],
    ['=>', TokenKind.FatArrow],
    ['&', TokenKind.ComposeOperator],
    ['**', TokenKind.PowerOperator],
    ['+', TokenKind.AddOperator],
    ['-', TokenKind.SubtractOperator],
    ['%', TokenKind.ModuloOperator],
    ['*', TokenKind.MultiplyOperator],
    ['/', TokenKind.DivideOperator],
    ['<=', TokenKind.LessEqual],
    ['<', TokenKind.LessThan],
    ['>=', TokenKind.GreaterEqual],
    ['>', TokenKind.GreaterThan],
    ['!=', TokenKind.NotEqual],
    ['=', TokenKind.Equal],
    ['..', TokenKind.RangeOperator],
    ['in', TokenKind.InOperator],
    ['true', TokenKind.BooleanLiteral],
    ['false', TokenKind.BooleanLiteral],
    ['let', TokenKind.Keyword],
    ['interface', TokenKind.Keyword],
    ['implement', TokenKind.Keyword],
    ['hello', TokenKind.Identifier],
  ])('parses %s as a %s token', (code, kind) => {
    expect(tokenize(code)).toEqual([tokenOf(kind, code)]);
  });

  it('parses identifiers that start with a keyword', () => {
    const code = 'interfaceObject';
    expect(tokenize(code)).toEqual([tokenOf(TokenKind.Identifier, code)]);
  });

  it('parses integer numbers', () => {
    const code = '123';
    expect(tokenize(code)).toEqual([tokenOf(TokenKind.IntegerLiteral, code)]);
  });

  describe('floating numbers', () => {
    it.each([
      ['123.123', 'simple float numbers'],
      ['.129', 'numbers missing leading 0'],
      ['123.123e10', 'numbers with lowercase exponent'],
      ['123.123E10', 'numbers with lowercase exponent'],
    ])('parses %s as float tokens', (code) => {
      expect(tokenize(code)).toEqual([tokenOf(TokenKind.FloatLiteral, code)]);
    });

    it.each([
      '123',
      '123.',
      'E10',
      '1E',
      '.',
    ])('%s does not match a float literal', (code) => {
      let tokens: Token[] = [];
      // Have to wrap this in a catch block since tokenize throws errors
      try {
        tokens = tokenize(code);
      } catch (e) {}
      expect(tokens).not.toContainEqual(expect.objectContaining({ kind: TokenKind.FloatLiteral }));
    });
  });

  it.each([
    ['double', '"abc"'],
    ['single', "'abc'"],
  ])('parses string literals with %s quotes', (_, code) => {
    expect(tokenize(code)).toEqual([tokenOf(TokenKind.StringLiteral, code)]);
  });

  describe('comments', () => {
    it('does not emit comments', () => {
      const code = '-- Hello';
      expect(tokenize(code)).toEqual([]);
    });

    it('parses tokens before comments', () => {
      const code = ':--Hello';
      expect(tokenize(code)).toEqual([tokenOf(TokenKind.Colon, ':')]);
    });

    it.each([
      ['line feed', '\n'],
      ['carriage return', '\r'],
      ['line feed and carriage return', '\n\r'],
    ])('parses tokens after comments ending with %s', (_, lineEnd) => {
      const code = `:--Hello${lineEnd}:`;
      expect(tokenize(code)).toEqual([
        tokenOf(TokenKind.Colon, ':'),
        tokenOf(TokenKind.Colon, ':', [1, 0]),
      ]);
    });
  });
});
