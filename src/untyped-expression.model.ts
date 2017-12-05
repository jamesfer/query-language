import { Message } from './message.model';
import { Token } from './token.model';

interface UntypedExpressionInterface<K> {
  kind: K;
  tokens: Token[];
  messages: Message[];
}

export interface UntypedFunctionCallExpression extends UntypedExpressionInterface<'FunctionCall'> {
  functionExpression: UntypedExpression;
  args: (UntypedExpression | null)[];
}

export interface UntypedArrayExpression extends UntypedExpressionInterface<'Array'> {
  elements: UntypedExpression[];
}

export interface UntypedIdentifierExpression extends UntypedExpressionInterface<'Identifier'> {
  value: string;
}

export interface UntypedNumericExpression extends UntypedExpressionInterface<'Numeric'> {
  value: string;
}

export interface UntypedStringExpression extends UntypedExpressionInterface<'String'> {
  value: string;
}

export interface UntypedNoneExpression extends UntypedExpressionInterface<'None'> {}

export interface UntypedUnrecognizedExpression extends UntypedExpressionInterface<'Unrecognized'> {}

export type UntypedExpression = UntypedFunctionCallExpression
  | UntypedStringExpression
  | UntypedNumericExpression
  | UntypedArrayExpression
  | UntypedIdentifierExpression
  | UntypedUnrecognizedExpression
  | UntypedNoneExpression;

export function makeUntypedNoneExpression(): UntypedNoneExpression {
  return {
    kind: 'None',
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
