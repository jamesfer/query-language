import { Message } from './message.model';
import { Token } from './token.model';

interface UntypedExpressionInterface<K> {
  kind: K;
  tokens: Token[];
  messages: Message[];
}

export interface UntypedFunctionCallExpression extends UntypedExpressionInterface<'FunctionCall'> {
  functionExpression: Expression;
  args: (Expression | null)[];
}

export interface UntypedArrayLiteralExpression extends UntypedExpressionInterface<'ArrayLiteral'> {
  elements: Expression[];
}

export interface UntypedIdentifierExpression extends UntypedExpressionInterface<'Identifier'> {
  value: string;
}

export interface UntypedNumericLiteralExpression extends UntypedExpressionInterface<'NumericLiteral'> {
  value: string;
}

export interface UntypedStringLiteralExpression extends UntypedExpressionInterface<'StringLiteral'> {
  value: string;
}

export interface UntypedNoneExpression extends UntypedExpressionInterface<'NoneLiteral'> {}

export interface UntypedUnrecognizedExpression extends UntypedExpressionInterface<'Unrecognized'> {}

export type Expression = UntypedFunctionCallExpression
  | UntypedStringLiteralExpression
  | UntypedNumericLiteralExpression
  | UntypedArrayLiteralExpression
  | UntypedIdentifierExpression
  | UntypedUnrecognizedExpression
  | UntypedNoneExpression;

export function makeUntypedNoneExpression(): UntypedNoneExpression {
  return {
    kind: 'NoneLiteral',
    tokens: [],
    messages: [],
  };
}

export function makeUntypedUnrecognizedExpression(tokens: Token[]): UntypedUnrecognizedExpression {
  return {
    kind: 'Unrecognized',
    tokens,
    messages: [],
  };
}
