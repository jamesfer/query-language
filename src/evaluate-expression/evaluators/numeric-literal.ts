import { TypedFloatLiteralExpression, TypedIntegerLiteralExpression } from '../../type-expression/typers/numeric-literal';
import { toNumber } from 'lodash';
import { FloatValue, IntegerValue, ValueFunction } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateIntegerLiteral(scope: EvaluationScope, expression: TypedIntegerLiteralExpression): ValueFunction<IntegerValue> {
  let value = toNumber(expression.expression.contents);
  return () => ({
    kind: 'Integer',
    value,
  });
}

export function evaluateFloatLiteral(scope: EvaluationScope, expression: TypedFloatLiteralExpression): ValueFunction<FloatValue> {
  let value = toNumber(expression.expression.contents);
  return () => ({
    kind: 'Float',
    value,
  });
}
