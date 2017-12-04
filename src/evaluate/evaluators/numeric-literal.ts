import { toNumber } from 'lodash';
import {
  FloatLiteralExpression,
  } from '../../expression.model';
import {
  FloatValue,
  IntegerValue,
  LazyValue,
  makeLazyFloatValue,
  makeLazyIntegerValue,
} from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';
import { IntegerLiteralExpression } from '../../expression.model';

export function evaluateIntegerLiteral(scope: EvaluationScope, expression: IntegerLiteralExpression): LazyValue<IntegerValue> {
  return makeLazyIntegerValue(toNumber(expression.expression.value));
}

export function evaluateFloatLiteral(scope: EvaluationScope, expression: FloatLiteralExpression): LazyValue<FloatValue> {
  return makeLazyFloatValue(toNumber(expression.expression.value));
}
