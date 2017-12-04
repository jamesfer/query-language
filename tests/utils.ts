import { Token, TokenKind } from '../src/token.model';
import { partial } from 'lodash';
import {
  ArrayExpressionExpectation, ExpressionExpectation,
  FunctionExpressionExpectation,
  ValueExpressionExpectation,
} from './runner';
import {
  IntegerType, makeArrayType, StringType,
  Type,
  FloatType,
} from '../src/type.model';

function makeToken(kind: TokenKind, value: string, begin: number = 0): Token {
  return {
    kind,
    value,
    begin,
    end: begin + value.length,
  };
}

export const identifierToken: (value: string, begin?: number) => Token
  = partial(makeToken, TokenKind.Identifier);
export const numericToken: (value: string, begin?: number) => Token
  = partial(makeToken, TokenKind.NumericLiteral);
export const stringToken: (value: string, begin?: number) => Token
  = partial(makeToken, TokenKind.StringLiteral);

export const openBraceToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.OpenBrace, '{');
export const closeBraceToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.CloseBrace, '}');
export const openParenToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.OpenParen, '(');
export const closeParenToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.CloseParen, ')');
export const openBracketToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.OpenBracket, '[');
export const closeBracketToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.CloseBracket, ']');
export const commaToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.Comma, ',');
export const colonToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.Colon, ':');
export const addToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.AddOperator, '+');
export const subtractToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.SubtractOperator, '-');
export const multiplyToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.MultiplyOperator, '*');
export const divideToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.DivideOperator, '/');
export const moduloToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.ModuloOperator, '%');
export const powerToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.PowerOperator, '**');
export const composeToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.ComposeOperator, '&');
export const inToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.InOperator, 'in');
export const rangeToken: (begin?: number) => Token
  = partial(makeToken, TokenKind.RangeOperator, '..');


export function functionCallExpression(
  resultType: Type | null,
  functionExpression: ExpressionExpectation,
  args: (ExpressionExpectation | null)[],
): FunctionExpressionExpectation {
  return {
    kind: 'FunctionCall',
    resultType,
    functionExpression,
    args,
  };
}

export function arrayExpression(
  elementType: Type | null, elements: ExpressionExpectation[],
): ArrayExpressionExpectation {
  return {
    kind: 'ArrayLiteral',
    resultType: makeArrayType(elementType),
    elements,
  };
}

function valueExpression(
  kind: 'StringLiteral' | 'IntegerLiteral' | 'FloatLiteral' | 'Identifier', resultType: Type | null, value: any,
): ValueExpressionExpectation {
  return {
    kind,
    resultType,
    value,
  };
}

export const stringExpression = partial(valueExpression, 'StringLiteral', StringType);
export const integerExpression = partial(valueExpression, 'IntegerLiteral', IntegerType);
export const floatExpression = partial(valueExpression, 'FloatLiteral', FloatType);
export const identifierExpression = partial(valueExpression, 'Identifier');

// function noneExpression(): ExpressionExpectation {
//
// }
// function unrecognizedExpression(): ExpressionExpectation {
//
// }

