import { Observable } from 'rxjs/Observable';
import { StringLiteralExpression } from '../../expression.model';
import { LazyValue, makeStringValue, StringValue } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateStringLiteral(scope: EvaluationScope, expression: StringLiteralExpression): LazyValue<StringValue> {
  return Observable.of(makeStringValue(expression.value));
}
