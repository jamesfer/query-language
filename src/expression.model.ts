import { assign } from 'lodash';
import { Message } from './message.model';
import { Token } from './token.model';
import {
  ArrayType,
  FloatType,
  IntegerType,
  NoneType,
  StringType,
  Type,
} from './type.model';
import {
  UntypedExpression,
  UntypedIdentifierExpression,
  UntypedNoneExpression,
  UntypedStringLiteralExpression,
} from './untyped-expression.model';

interface ExpressionInterface<K extends string, T extends (Type | null) = Type | null> {
  kind: K;
  resultType: T;
  messages: Message[];
  tokens: Token[];
}

export interface IntegerLiteralExpression extends ExpressionInterface<'IntegerLiteral', IntegerType> {
  value: number,
}

export interface FloatLiteralExpression extends ExpressionInterface<'FloatLiteral', FloatType> {
  value: number,
}

export interface StringLiteralExpression extends ExpressionInterface<'StringLiteral', StringType> {
  value: string;
}

export interface IdentifierExpression extends ExpressionInterface<'Identifier'> {
  value: string;
}

export interface FunctionCallExpression extends ExpressionInterface<'FunctionCall'> {
  functionExpression: Expression,
  args: (Expression | null)[],
}

export interface ArrayLiteralExpression extends ExpressionInterface<'ArrayLiteral', ArrayType> {
  elements: Expression[],
}

export interface UnrecognizedExpression extends ExpressionInterface<'Unrecognized', null> {};

export interface NoneLiteralExpression extends ExpressionInterface<'NoneLiteral', NoneType> {};

export type Expression = FunctionCallExpression
  | IdentifierExpression
  | StringLiteralExpression
  | FloatLiteralExpression
  | NoneLiteralExpression
  | IntegerLiteralExpression
  | ArrayLiteralExpression
  | UnrecognizedExpression;


export function addType(expression: UntypedStringLiteralExpression, resultType: StringType, messages?: Message[]): StringLiteralExpression;
export function addType(expression: UntypedIdentifierExpression, resultType: Type | null, messages?: Message[]): IdentifierExpression;
export function addType(expression: UntypedNoneExpression, resultType: NoneType, messages?: Message[]): NoneLiteralExpression;
export function addType(expression: UntypedExpression, resultType: null, messages?: Message[]): UnrecognizedExpression;
export function addType(expression: UntypedExpression, resultType: Type | null, messages: Message[] = []): Expression {
  expression.messages = expression.messages.concat(messages);
  return assign(expression, { resultType }) as Expression;
}



