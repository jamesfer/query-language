import { Message } from './message.model';
import { Expression } from './expression.model';
import { NoneType, Type } from './type.model';
import { TypedStringLiteralExpression } from './type-expression/typers/string-literal';
import { TypedFloatLiteralExpression, TypedIntegerLiteralExpression } from './type-expression/typers/numeric-literal';
import { TypedFunctionCallExpression } from './type-expression/typers/function-call';
import { TypedIdentifierExpression } from './type-expression/typers/identifier';
import { TypedArrayLiteralExpression } from './type-expression/typers/array-literal';
// import { TypedParenthesisExpression } from './type-expression/typers/parenthesis';

export interface TypedExpressionInterface<K extends string, E extends Expression = Expression> {
  kind: K;
  resultType: Type | null;
  messages: Message[];
  expression: E;
}

export type TypedExpression = TypedFunctionCallExpression
  | TypedIdentifierExpression
  | TypedStringLiteralExpression
  | TypedFloatLiteralExpression
  | TypedNoneLiteralExpression
  | TypedIntegerLiteralExpression
  // | TypedParenthesisExpression
  | TypedArrayLiteralExpression
  | TypedUnrecognizedExpression;


export interface TypedUnrecognizedExpression extends TypedExpressionInterface<'Unrecognized'> {
  resultType: null,
}
export interface TypedNoneLiteralExpression extends TypedExpressionInterface<'NoneLiteral'> {
  resultType: NoneType
}
