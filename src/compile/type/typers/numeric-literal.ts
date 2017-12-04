import { isInteger, assign, isNaN } from 'lodash';
import { UntypedNumericLiteralExpression } from '../../../untyped-expression.model';
import { makeMessage } from '../../../message.model';
import {
  addType,
  FloatLiteralExpression,
  IntegerLiteralExpression,
} from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';
import { FloatType, IntegerType } from '../../../type.model';

export function parseNumericLiteral(scope: TypedScope, expression: UntypedNumericLiteralExpression): IntegerLiteralExpression | FloatLiteralExpression {
  let strValue = expression.value;
  let value = +strValue;
  let result = {
    resultType: IntegerType,
    messages: [],
    tokens: expression.tokens,
    value,
  };

  if (isNaN(value)) {
    return {
      ...result,
      kind: 'IntegerLiteral',
      messages: [ makeMessage('Error', `Invalid numeric literal ${strValue}.`) ],
    };
  }
  else if (isInteger(value)) {
    return {
      ...result,
      kind: 'IntegerLiteral',
    };
  }
  else {
    return {
      ...result,
      kind: 'FloatLiteral',
      resultType: FloatType,
    };
  }
}
