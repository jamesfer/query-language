import { toNumber } from 'lodash';
import {
  TypedFloatLiteralExpression,
  } from '../../typed-expression.model';
import {
  FloatValue,
  IntegerValue,
  LazyValue,
  makeLazyFloatValue,
  makeLazyIntegerValue,
} from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';
import { TypedIntegerLiteralExpression } from '../../typed-expression.model';

export function evaluateIntegerLiteral(scope: EvaluationScope, expression: TypedIntegerLiteralExpression): LazyValue<IntegerValue> {
  return makeLazyIntegerValue(toNumber(expression.expression.value));
}

export function evaluateFloatLiteral(scope: EvaluationScope, expression: TypedFloatLiteralExpression): LazyValue<FloatValue> {
  return makeLazyFloatValue(toNumber(expression.expression.value));
}
