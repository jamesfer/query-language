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

export enum TokenKind {
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
  LessThan,
  LessEqual,
  GreaterThan,
  GreaterEqual,
  Equal,
  NotEqual,
  InOperator,
  SpreadOperator,
  RangeOperator,
  FatArrow,
  ComposeOperator,
}

// export interface Position {
//   line: number,
//   position: number,
// }

export type Position = [number, number];

export class Token {
  kind: TokenKind;
  value: string;
  begin: Position;
  end: Position;
}
