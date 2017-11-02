import { TypedFloatLiteralExpression, TypedIntegerLiteralExpression } from '../../type-expression/typers/numeric-literal';
import { toNumber } from 'lodash';
import {
  FloatValue, IntegerValue, LazyValue, makeLazyFloatValue,
  makeLazyIntegerValue,
} from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateIntegerLiteral(scope: EvaluationScope, expression: TypedIntegerLiteralExpression): LazyValue<IntegerValue> {
  return makeLazyIntegerValue(toNumber(expression.expression.contents));
}

export function evaluateFloatLiteral(scope: EvaluationScope, expression: TypedFloatLiteralExpression): LazyValue<FloatValue> {
  return makeLazyFloatValue(toNumber(expression.expression.contents));
}
