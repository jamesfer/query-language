import { assign, Dictionary } from 'lodash';
import { Message } from './message';
import { Token } from './token';
import {
  ArrayType,
  FloatType,
  IntegerType,
  NoneType,
  StringType,
  Type,
  BooleanType,
} from './type/type';
import {
  UntypedBooleanExpression,
  UntypedExpression,
  UntypedIdentifierExpression,
  UntypedNoneExpression,
  UntypedStringExpression,
} from './untyped-expression';
import { FunctionValue } from './value';

export interface ExpressionInterface<K extends string, T extends (Type | null) = Type | null> {
  kind: K;
  resultType: T;
  messages: Message[];
  tokens: Token[];
}

export interface IntegerExpression extends ExpressionInterface<'Integer', IntegerType> {
  value: number,
}

export interface FloatExpression extends ExpressionInterface<'Float', FloatType> {
  value: number,
}

export interface StringExpression extends ExpressionInterface<'String', StringType> {
  value: string;
}

export interface BooleanExpression extends ExpressionInterface<'Boolean', BooleanType> {
  value: boolean;
}

export interface IdentifierExpression extends ExpressionInterface<'Identifier'> {
  value: string;
  expression: Expression | null,
}

export interface ArrayExpression extends ExpressionInterface<'Array', ArrayType> {
  elements: Expression[],
}

export interface FunctionCallExpression extends ExpressionInterface<'FunctionCall'> {
  functionExpression: Expression,
  args: (Expression | null)[],
}

export interface FunctionExpression extends ExpressionInterface<'Function'> {
  value: FunctionValue | Expression,
  argumentNames: string[]
}

export interface MethodExpression extends ExpressionInterface<'Method'> {
  implementations: Dictionary<{
    instance: Type,
    value: FunctionValue | Expression,
    argumentNames: string[],
  }>,
}

export interface UnrecognizedExpression extends ExpressionInterface<'Unrecognized', null> {};

export interface NoneExpression extends ExpressionInterface<'None', NoneType> {};

export type Expression = FunctionCallExpression
  | IdentifierExpression
  | StringExpression
  | FloatExpression
  | BooleanExpression
  | NoneExpression
  | IntegerExpression
  | ArrayExpression
  | UnrecognizedExpression
  | MethodExpression
  | FunctionExpression;


export function addType(expression: UntypedStringExpression, resultType: StringType, messages?: Message[]): StringExpression;
export function addType(expression: UntypedBooleanExpression, resultType: BooleanType, messages?: Message[]): BooleanExpression;
export function addType(expression: UntypedIdentifierExpression, resultType: Type | null, messages?: Message[]): IdentifierExpression;
export function addType(expression: UntypedNoneExpression, resultType: NoneType, messages?: Message[]): NoneExpression;
export function addType(expression: UntypedExpression, resultType: null, messages?: Message[]): UnrecognizedExpression;
export function addType(expression: UntypedExpression, resultType: Type | null, messages: Message[] = []): Expression {
  expression.messages = expression.messages.concat(messages);
  return assign(expression, { resultType }) as Expression;
}



