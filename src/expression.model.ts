import {
  UntypedExpression,
  UntypedIdentifierExpression,
  UntypedNumericLiteralExpression,
} from './untyped-expression.model';
import { Message } from './message.model';
import {
  ArrayType,
  FloatType,
  IntegerType,
  NoneType,
  StringType,
  Type,
} from './type.model';

interface ExpressionInterface<K extends string, E extends UntypedExpression = UntypedExpression> {
  kind: K;
  resultType: Type | null;
  messages: Message[];
  expression: E;
}

export interface StringLiteralExpression extends ExpressionInterface<'StringLiteral'> {
  resultType: StringType;
  value: string;
}

export interface IntegerLiteralExpression extends ExpressionInterface<'IntegerLiteral', UntypedNumericLiteralExpression> {
  resultType: IntegerType;
  value: number;
}

export interface FloatLiteralExpression extends ExpressionInterface<'FloatLiteral', UntypedNumericLiteralExpression> {
  resultType: FloatType;
  value: number;
}

export interface IdentifierExpression extends ExpressionInterface<'Identifier'> {
  expression: UntypedIdentifierExpression;
  value: string;
}

export interface FunctionCallExpression extends ExpressionInterface<'FunctionCall'> {
  functionExpression: Expression;
  args: (Expression | null)[];
}

export interface ArrayLiteralExpression extends ExpressionInterface<'ArrayLiteral'> {
  resultType: ArrayType;
  elements: Expression[];
}

export interface UnrecognizedExpression extends ExpressionInterface<'Unrecognized'> {
  resultType: null,
}

export interface NoneLiteralExpression extends ExpressionInterface<'NoneLiteral'> {
  resultType: NoneType
}

export type Expression = FunctionCallExpression
  | IdentifierExpression
  | StringLiteralExpression
  | FloatLiteralExpression
  | NoneLiteralExpression
  | IntegerLiteralExpression
  | ArrayLiteralExpression
  | UnrecognizedExpression;



