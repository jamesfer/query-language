import { isInteger, isNaN } from 'lodash';
import { UntypedNumericLiteralExpression } from '../../../untyped-expression.model';
import { makeMessage } from '../../../message.model';
import {
  TypedFloatLiteralExpression,
  TypedIntegerLiteralExpression,
} from '../../../typed-expression.model';
import { TypedScope } from '../typed-scope.model';

export function parseNumericLiteral(scope: TypedScope, expression: UntypedNumericLiteralExpression): TypedIntegerLiteralExpression | TypedFloatLiteralExpression {
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
