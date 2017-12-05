import {
  FloatExpression,
  IdentifierExpression,
  IntegerExpression, StringExpression,
} from '../../expression.model';
import {
  FloatValue, IntegerValue, LazyValue, makeLazyFloatValue,
  makeLazyIntegerValue, makeStringValue, StringValue,
} from '../../value.model';
import { EvaluationScope, } from '../evaluation-scope';
import { toNumber } from 'lodash';
import { Observable } from 'rxjs/Observable';

export function evaluateIdentifier(scope: EvaluationScope, expression: IdentifierExpression): LazyValue {
  return scope[expression.value];
}

export function evaluateIntegerLiteral(scope: EvaluationScope, expression: IntegerExpression): LazyValue<IntegerValue> {
  return makeLazyIntegerValue(toNumber(expression.value));
}

export function evaluateFloatLiteral(scope: EvaluationScope, expression: FloatExpression): LazyValue<FloatValue> {
  return makeLazyFloatValue(toNumber(expression.value));
}

export function evaluateStringLiteral(scope: EvaluationScope, expression: StringExpression): LazyValue<StringValue> {
  return Observable.of(makeStringValue(expression.value));
}
