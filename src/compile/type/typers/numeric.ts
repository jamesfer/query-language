import { isInteger, assign, isNaN } from 'lodash';
import { UntypedNumericExpression } from '../../../untyped-expression.model';
import { makeMessage } from '../../../message.model';
import {
  addType,
  FloatExpression,
  IntegerExpression,
} from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';
import { FloatType, IntegerType } from '../../../type.model';

export function parseNumericExpression(scope: TypedScope, expression: UntypedNumericExpression): IntegerExpression | FloatExpression {
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
      kind: 'Integer',
      messages: [ makeMessage('Error', `Invalid numeric literal ${strValue}.`) ],
    };
  }
  else if (isInteger(value)) {
    return {
      ...result,
      kind: 'Integer',
    };
  }
  else {
    return {
      ...result,
      kind: 'Float',
      resultType: FloatType,
    };
  }
}
