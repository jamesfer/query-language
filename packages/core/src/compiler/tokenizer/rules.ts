import { Rule } from 'moo';
import { TokenKind } from '../../token';

export const mooRules: { [k in TokenKind]: RegExp | string | string[] | Rule | Rule[] } = {
  WhiteSpace: { match: /\s+/, lineBreaks: true },
  Comment: /--[^\n\r]*/,

  // Structure Characters
  OpenBrace: '{',
  CloseBrace: '}',
  OpenParen: '(',
  CloseParen: ')',
  OpenBracket: '[',
  CloseBracket: ']',
  Comma: ',',
  Colon: ':',

  // Operators
  ComposeOperator: '&',
  PowerOperator: '**',
  AddOperator: '+',
  SubtractOperator: '-',
  ModuloOperator: '%',
  MultiplyOperator: '*',
  DivideOperator: '/',
  LessEqual: '<=',
  LessThan: '<',
  GreaterEqual: '>=',
  GreaterThan: '>',
  NotEqual: '!=',
  Equal: '=',
  RangeOperator: '..',
  FatArrow: '=>',
  // TODO this will collide with keywords starting with "in"
  InOperator: 'in',

  // Literals
  BooleanLiteral: ['true', 'false'],
  FloatLiteral: /[0-9]+(?:(?:\.[0-9]*)?[eE]-?[0-9]+|\.[0-9]*)(?!\.)/,
  IntegerLiteral: /[0-9]+/,
  StringLiteral: /(?:'(?:\\\\|\\'|(?!').)*'?|"(?:\\\\|\\"|(?!").)*"?)/,

  // Identifiers
  Identifier: /[_a-zA-Z][_a-zA-Z0-9]*/,
};
