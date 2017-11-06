import { TypedArrayLiteralExpression } from './compile/type/typers/array-literal';
import { TypedFunctionCallExpression } from './compile/type/typers/function-call';
import { TypedIdentifierExpression } from './compile/type/typers/identifier';
import {
  TypedFloatLiteralExpression,
  TypedIntegerLiteralExpression,
} from './compile/type/typers/numeric-literal';
import { TypedStringLiteralExpression } from './compile/type/typers/string-literal';
import { Expression } from './expression.model';
import { Message } from './message.model';
import { NoneType, Type } from './type.model';

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
  | TypedArrayLiteralExpression
  | TypedUnrecognizedExpression;


export interface TypedUnrecognizedExpression extends TypedExpressionInterface<'Unrecognized'> {
  resultType: null,
}
export interface TypedNoneLiteralExpression extends TypedExpressionInterface<'NoneLiteral'> {
  resultType: NoneType
}
