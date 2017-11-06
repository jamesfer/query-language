import { FunctionCallExpression } from './compile/interpret/interpreters/function-call';
import { IdentifierExpression } from './compile/interpret/interpreters/identifier';
import { ArrayLiteralExpression } from './compile/interpret/interpreters/literal/array-literal';
import { NumericLiteralExpression } from './compile/interpret/interpreters/literal/numeric-literal';
import { StringLiteralExpression } from './compile/interpret/interpreters/literal/string-literal';
import { NoneExpression } from './compile/interpret/interpreters/none';
import { UnrecognizedExpression } from './compile/interpret/interpreters/unrecognized';
import { Message } from './message.model';
import { Token } from './token.model';

export interface ExpressionInterface<K> {
  kind: K;
  tokens: Token[];
  messages: Message[];
}

export type Expression = FunctionCallExpression
  | StringLiteralExpression
  | NumericLiteralExpression
  | ArrayLiteralExpression
  | IdentifierExpression
  | UnrecognizedExpression
  | NoneExpression;
