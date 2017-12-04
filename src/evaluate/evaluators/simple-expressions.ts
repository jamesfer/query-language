import {
  FloatLiteralExpression,
  IdentifierExpression,
  IntegerLiteralExpression, StringLiteralExpression,
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

export function evaluateIntegerLiteral(scope: EvaluationScope, expression: IntegerLiteralExpression): LazyValue<IntegerValue> {
  return makeLazyIntegerValue(toNumber(expression.value));
}

export function evaluateFloatLiteral(scope: EvaluationScope, expression: FloatLiteralExpression): LazyValue<FloatValue> {
  return makeLazyFloatValue(toNumber(expression.value));
}

export function evaluateStringLiteral(scope: EvaluationScope, expression: StringLiteralExpression): LazyValue<StringValue> {
  return Observable.of(makeStringValue(expression.value));
}
