import { Rule, keywords } from 'moo';
import { TokenKind } from '../../token';

export type Rules = { [k in TokenKind]: RegExp | string | string[] | Rule | Rule[] };

const keywordsRules = { Keyword: ['let'] };

const rules: Rules = {
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
  FatArrow: '=>',
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
  // TODO this will collide with keywords starting with "in"
  InOperator: 'in',

  // Literals
  BooleanLiteral: ['true', 'false'],
  FloatLiteral: /[0-9]+(?:(?:\.[0-9]*)?[eE]-?[0-9]+|\.[0-9]*)(?!\.)/,
  IntegerLiteral: /[0-9]+/,
  StringLiteral: /(?:'(?:\\\\|\\'|(?!').)*'?|"(?:\\\\|\\"|(?!").)*"?)/,

  // Identifiers
  Identifier: {
    type: keywords(keywordsRules),
    match: /[_a-zA-Z][_a-zA-Z0-9]*/,
  },

  // TODO this is unneeded as keywords are handled by the identifier type. However, it is required
  //      because of the limitations of enum types. TokenKind should be changed to a union.
  ...keywordsRules,
};

export default rules;
