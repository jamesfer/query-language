import {
  UntypedFloatExpression,
  UntypedIntegerExpression,
} from '../../../untyped-expression.model';
import {
  FloatExpression,
  IntegerExpression,
} from '../../../expression.model';
import { TypedScope } from '../typed-scope.model';
import { FloatType, IntegerType } from '../../../type.model';

export function parseNumericExpression(scope: TypedScope, expression: UntypedFloatExpression | UntypedIntegerExpression): IntegerExpression | FloatExpression {
  if (expression.kind === 'Integer') {
    return {
      ...expression,
      resultType: IntegerType,
    };
  }
  return {
    ...expression,
    resultType: FloatType,
  }
}
