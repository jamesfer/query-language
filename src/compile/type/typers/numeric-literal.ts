import { isInteger, isNaN } from 'lodash';
import { makeMessage } from '../../../message.model';
import { FloatType, IntegerType } from '../../../type.model';
import { TypedExpressionInterface } from '../../../typed-expression.model';
import { NumericLiteralExpression } from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';

export interface TypedIntegerLiteralExpression extends TypedExpressionInterface<'IntegerLiteral', NumericLiteralExpression> {
  resultType: IntegerType;
  value: number;
}

export interface TypedFloatLiteralExpression extends TypedExpressionInterface<'FloatLiteral', NumericLiteralExpression> {
  resultType: FloatType;
  value: number;
}

export function parseNumericLiteral(scope: TypedScope, expression: NumericLiteralExpression): TypedIntegerLiteralExpression | TypedFloatLiteralExpression {
  let strValue = expression.value;
  let value = +strValue;
  if (isNaN(value)) {
    return {
      kind: 'IntegerLiteral',
      resultType: { kind: 'Integer' },
      messages: [ makeMessage('Error', `Invalid numeric literal ${strValue}.`) ],
      expression,
      value,
    };
  }
  else if (isInteger(value)) {
    return {
      kind: 'IntegerLiteral',
      resultType: { kind: 'Integer' },
      messages: [],
      expression,
      value,
    };
  } else {
    return {
      kind: 'FloatLiteral',
      resultType: { kind: 'Float' },
      messages: [],
      value,
      expression,
    };
  }
}
