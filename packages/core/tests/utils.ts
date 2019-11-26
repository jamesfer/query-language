import { Token, TokenKind} from '../src/token';
import { Function2, partial } from 'lodash';
import {
  ArrayExpressionExpectation, ExpressionExpectation,
  FunctionCallExpressionExpectation,
  ValueExpressionExpectation,
} from './runner';
import {
  type,
  Type,
} from '../src/compiler/type/type';
import { addPositions, Position } from '../src/position';
import {
  booleanType, floatType, integerType, lazyValue, listType,
  stringType,
} from '../src/compiler/value-constructors';

function makeToken(kind: TokenKind, value: string, begin: Position | number = [ 0, 0 ]): Token {
  if (typeof begin === 'number') {
    begin = [ 0, begin ];
  }
  return {
    kind,
    value,
    begin,
    end: addPositions(begin, value.length),
  };
}

export const identifierToken: (value: string, begin?: Position | number) => Token
  = partial(makeToken, TokenKind.Identifier);
export const integerToken: (value: string, begin?: Position | number) => Token
  = partial(makeToken, TokenKind.IntegerLiteral);
export const floatToken: (value: string, begin?: Position | number) => Token
  = partial(makeToken, TokenKind.FloatLiteral);
export const booleanToken: (value: string, begin?: Position | number) => Token
  = partial(makeToken, TokenKind.BooleanLiteral);
export const stringToken: (value: string, begin?: Position | number) => Token
  = partial(makeToken, TokenKind.StringLiteral);
export const commentToken: (value: string, begin?: Position | number) => Token
  = partial(makeToken, TokenKind.Comment);

export const openBraceToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.OpenBrace, '{');
export const closeBraceToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.CloseBrace, '}');
export const openParenToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.OpenParen, '(');
export const closeParenToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.CloseParen, ')');
export const openBracketToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.OpenBracket, '[');
export const closeBracketToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.CloseBracket, ']');
export const commaToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.Comma, ',');
export const colonToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.Colon, ':');
export const addToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.AddOperator, '+');
export const subtractToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.SubtractOperator, '-');
export const multiplyToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.MultiplyOperator, '*');
export const divideToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.DivideOperator, '/');
export const moduloToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.ModuloOperator, '%');
export const powerToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.PowerOperator, '**');
export const composeToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.ComposeOperator, '&');
export const inToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.InOperator, 'in');
export const rangeToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.RangeOperator, '..');
export const fatArrowToken: (begin?: Position | number) => Token
  = partial(makeToken, TokenKind.FatArrow, '=>');


export function functionCallExpression(
  resultType: Type | null,
  functionExpression: ExpressionExpectation,
  args: (ExpressionExpectation | null)[],
): FunctionCallExpressionExpectation {
  return {
    kind: 'FunctionCall',
    resultType,
    functionExpression,
    args,
  };
}

export function arrayExpression(
  elementType: Type, elements: ExpressionExpectation[],
): ArrayExpressionExpectation {
  return {
    elements,
    kind: 'Array',
    resultType: { ...elementType, value: lazyValue(listType(elementType.value)) },
  };
}

function valueExpression(
  kind: 'String' | 'Integer' | 'Float' | 'Identifier' | 'Boolean',
  resultType: Type | null,
  value: any,
): ValueExpressionExpectation {
  return {
    kind,
    resultType,
    value,
  };
}

export const stringExpression = partial(valueExpression, 'String', type(lazyValue(stringType)));
export const integerExpression = partial(valueExpression, 'Integer', type(lazyValue(integerType)));
export const floatExpression = partial(valueExpression, 'Float', type(lazyValue(floatType)));
export const booleanExpression = partial(valueExpression, 'Boolean', type(lazyValue(booleanType)));
// Needs explicit type annotation to prevent "Exported variable X has
// or is using name Y from external module, but cannot be named" errors.
export const identifierExpression: Function2<Type | null, any, ValueExpressionExpectation> = partial(valueExpression, 'Identifier');

// function noneExpression(): ExpressionExpectation {
//
// }
// function unrecognizedExpression(): ExpressionExpectation {
//
// }

