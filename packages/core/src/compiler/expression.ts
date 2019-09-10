import { Token } from '../token';
import { Type } from './type/type';
// import { Type } from './type';
import { LazyValue } from './value';

export enum ExpressionKind {
  Anything,
  Nothing,
  Application,
  Identifier,
  Lambda,
  NativeLambda,
  PolymorphicLambda,
  Integer,
  Float,
  String,
  Boolean,
  List,
}

export type NativeLambda = (...parameters: LazyValue[]) => LazyValue;

export interface BaseExpression<K extends ExpressionKind> {
  kind: K;
  resultType: Type;
  tokens: Token[];
  implicitParameters: (string | number)[];
}

export interface AnythingExpression extends BaseExpression<ExpressionKind.Anything> {}

export interface NothingExpression extends BaseExpression<ExpressionKind.Nothing> {}

export interface IntegerExpression extends BaseExpression<ExpressionKind.Integer> {
  value: number;
}

export interface FloatExpression extends BaseExpression<ExpressionKind.Float> {
  value: number;
}

export interface StringExpression extends BaseExpression<ExpressionKind.String> {
  value: string;
}

export interface BooleanExpression extends BaseExpression<ExpressionKind.Boolean> {
  value: boolean;
}

export interface ListExpression extends BaseExpression<ExpressionKind.List> {
  elements: Expression[];
}

export interface ApplicationExpression extends BaseExpression<ExpressionKind.Application> {
  callee: Expression;
  parameters: (Expression | null)[];
}

export interface IdentifierExpression extends BaseExpression<ExpressionKind.Identifier> {
  name: string;
}

export interface LambdaExpression extends BaseExpression<ExpressionKind.Lambda> {
  body: Expression;
  parameterNames: string[];
}

export interface PolymorphicLambdaExpression extends BaseExpression<ExpressionKind.PolymorphicLambda> {
  lambdaName: string;
  parameterNames: string[];
}

export interface NativeLambdaExpression extends BaseExpression<ExpressionKind.NativeLambda> {
  parameterCount: number;
  body: NativeLambda;
}

export type Expression =
  | AnythingExpression
  | NothingExpression
  | ApplicationExpression
  | IdentifierExpression
  | LambdaExpression
  | NativeLambdaExpression
  | PolymorphicLambdaExpression
  | StringExpression
  | IntegerExpression
  | FloatExpression
  | BooleanExpression
  | ListExpression;
