import { Message } from './message.model';
import { Token } from './token.model';

export interface ExpressionInterface<K> {
  kind: K;
  tokens: Token[];
  messages: Message[];
}

export interface FunctionCallExpression extends ExpressionInterface<'FunctionCall'> {
  functionExpression: Expression;
  args: (Expression | null)[];
}

export interface ArrayLiteralExpression extends ExpressionInterface<'ArrayLiteral'> {
  elements: Expression[];
}

export interface IdentifierExpression extends ExpressionInterface<'Identifier'> {
  value: string;
}

export interface NumericLiteralExpression extends ExpressionInterface<'NumericLiteral'> {
  value: string;
}

export interface StringLiteralExpression extends ExpressionInterface<'StringLiteral'> {
  value: string;
}

export interface NoneExpression extends ExpressionInterface<'NoneLiteral'> {}

export interface UnrecognizedExpression extends ExpressionInterface<'Unrecognized'> {}

export type Expression = FunctionCallExpression
  | StringLiteralExpression
  | NumericLiteralExpression
  | ArrayLiteralExpression
  | IdentifierExpression
  | UnrecognizedExpression
  | NoneExpression;

export function makeNoneExpression(): NoneExpression {
  return {
    kind: 'NoneLiteral',
    tokens: [],
    messages: [],
  };
}

export function makeUnrecognizedExpression(tokens: Token[]): UnrecognizedExpression {
  return {
    kind: 'Unrecognized',
    tokens,
    messages: [],
  };
}
