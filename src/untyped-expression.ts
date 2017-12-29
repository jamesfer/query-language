import { Message } from './message';
import { Token } from './token';

export interface UntypedExpressionInterface<K> {
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

export interface UntypedFloatExpression extends UntypedExpressionInterface<'Float'> {
  value: number;
}

export interface UntypedIntegerExpression extends UntypedExpressionInterface<'Integer'> {
  value: number;
}

export interface UntypedStringExpression extends UntypedExpressionInterface<'String'> {
  value: string;
}

export interface UntypedBooleanExpression extends UntypedExpressionInterface<'Boolean'> {
  value: boolean;
}

export interface UntypedNoneExpression extends UntypedExpressionInterface<'None'> {}

export interface UntypedUnrecognizedExpression extends UntypedExpressionInterface<'Unrecognized'> {}

export type UntypedExpression = UntypedFunctionCallExpression
  | UntypedStringExpression
  | UntypedFloatExpression
  | UntypedIntegerExpression
  | UntypedBooleanExpression
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

export function makeUntypedUnrecognizedExpression(tokens: Token[], messages: Message[] = []): UntypedUnrecognizedExpression {
  return {
    kind: 'Unrecognized',
    tokens,
    messages,
  };
}
