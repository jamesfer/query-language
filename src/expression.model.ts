import { IdentifierExpression } from './compile/interpret/interpreters/identifier';
import { Token } from './token.model';
import { UnrecognizedExpression } from './compile/interpret/interpreters/unrecognized';
import { StringLiteralExpression } from './compile/interpret/interpreters/literal/string-literal';
import { NumericLiteralExpression } from './compile/interpret/interpreters/literal/numeric-literal';
import { ArrayLiteralExpression } from './compile/interpret/interpreters/literal/array-literal';
import { FunctionCallExpression } from './compile/interpret/interpreters/function-call';
import { NoneExpression } from './compile/interpret/interpreters/none';
import { Message } from './message.model';

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
