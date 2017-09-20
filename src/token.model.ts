// export type TokenKind = 'Identifier'
//   | 'NumericLiteral'
//   | 'StringLiteral'
//   | 'OpenBrace'
//   | 'CloseBrace'
//   | 'OpenParen'
//   | 'CloseParen'
//   | 'OpenBracket'
//   | 'CloseBracket'
//   | 'Comma'
//   | 'Colon'
//   | 'AddOperator'
//   | 'SubtractOperator'
//   | 'MultiplyOperator'
//   | 'DivideOperator'
//   | 'ModuloOperator'
//   | 'PowerOperator'
//   | 'InOperator'
//   | 'SpreadOperator';

export const enum TokenKind {
  Identifier,
  NumericLiteral,
  StringLiteral,
  OpenBrace,
  CloseBrace,
  OpenParen,
  CloseParen,
  OpenBracket,
  CloseBracket,
  Comma,
  Colon,
  AddOperator,
  SubtractOperator,
  MultiplyOperator,
  DivideOperator,
  ModuloOperator,
  PowerOperator,
  InOperator,
  SpreadOperator,
  RangeOperator,
}

export class Token {
  kind: TokenKind;
  value: string;
  begin: number;
  end: number;
}
