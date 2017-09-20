import { IdentifierExpression } from './build-expression/parsers/identifier';
import { Token } from './token.model';
import { UnrecognizedExpression } from './build-expression/parsers/unrecognized';
import { StringLiteralExpression } from './build-expression/parsers/literal/string-literal';
import { NumericLiteralExpression } from './build-expression/parsers/literal/numeric-literal';
import { ArrayLiteralExpression } from './build-expression/parsers/literal/array-literal';
import { FunctionCallExpression } from './build-expression/parsers/function-call';
import { NoneExpression } from './build-expression/parsers/none';
import { Message } from './message.model';
import { ParenthesisExpression } from './build-expression/parsers/parenthesis';

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
  | ParenthesisExpression
  | UnrecognizedExpression
  | NoneExpression;
