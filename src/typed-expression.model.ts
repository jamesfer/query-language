import {
  Expression,
  IdentifierExpression,
  NumericLiteralExpression,
} from './expression.model';
import { Message } from './message.model';
import {
  ArrayType,
  FloatType,
  IntegerType,
  NoneType,
  StringType,
  Type,
} from './type.model';

export interface TypedExpressionInterface<K extends string, E extends Expression = Expression> {
  kind: K;
  resultType: Type | null;
  messages: Message[];
  expression: E;
}

export interface TypedStringLiteralExpression extends TypedExpressionInterface<'StringLiteral'> {
  resultType: StringType;
}

export interface TypedIntegerLiteralExpression extends TypedExpressionInterface<'IntegerLiteral', NumericLiteralExpression> {
  resultType: IntegerType;
  value: number;
}

export interface TypedFloatLiteralExpression extends TypedExpressionInterface<'FloatLiteral', NumericLiteralExpression> {
  resultType: FloatType;
  value: number;
}

export interface TypedIdentifierExpression extends TypedExpressionInterface<'Identifier'> {
  expression: IdentifierExpression;
}

export interface TypedFunctionCallExpression extends TypedExpressionInterface<'FunctionCall'> {
  functionExpression: TypedExpression;
  args: (TypedExpression | null)[];
}

export interface TypedArrayLiteralExpression extends TypedExpressionInterface<'ArrayLiteral'> {
  resultType: ArrayType;
  elements: TypedExpression[];
}

export interface TypedUnrecognizedExpression extends TypedExpressionInterface<'Unrecognized'> {
  resultType: null,
}

export interface TypedNoneLiteralExpression extends TypedExpressionInterface<'NoneLiteral'> {
  resultType: NoneType
}

export type TypedExpression = TypedFunctionCallExpression
  | TypedIdentifierExpression
  | TypedStringLiteralExpression
  | TypedFloatLiteralExpression
  | TypedNoneLiteralExpression
  | TypedIntegerLiteralExpression
  | TypedArrayLiteralExpression
  | TypedUnrecognizedExpression;



