import { Position } from './position';

export enum TokenKind {
  WhiteSpace = 'WhiteSpace',
  Identifier = 'Identifier',
  IntegerLiteral = 'IntegerLiteral',
  FloatLiteral = 'FloatLiteral',
  StringLiteral = 'StringLiteral',
  OpenBrace = 'OpenBrace',
  CloseBrace = 'CloseBrace',
  OpenParen = 'OpenParen',
  CloseParen = 'CloseParen',
  OpenBracket = 'OpenBracket',
  CloseBracket = 'CloseBracket',
  Comma = 'Comma',
  Colon = 'Colon',
  AddOperator = 'AddOperator',
  SubtractOperator = 'SubtractOperator',
  MultiplyOperator = 'MultiplyOperator',
  DivideOperator = 'DivideOperator',
  ModuloOperator = 'ModuloOperator',
  PowerOperator = 'PowerOperator',
  LessThan = 'LessThan',
  LessEqual = 'LessEqual',
  GreaterThan = 'GreaterThan',
  GreaterEqual = 'GreaterEqual',
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  InOperator = 'InOperator',
  // SpreadOperator = 'SpreadOperator',
  RangeOperator = 'RangeOperator',
  FatArrow = 'FatArrow',
  ComposeOperator = 'ComposeOperator',
  BooleanLiteral = 'BooleanLiteral',
  Comment = 'Comment',
}

export class Token {
  kind: TokenKind;
  value: string;
  begin: Position;
  end: Position;
}
