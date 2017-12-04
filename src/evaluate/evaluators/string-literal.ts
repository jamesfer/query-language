import { Observable } from 'rxjs/Observable';
import { StringLiteralExpression } from '../../expression.model';
import { LazyValue, makeStringValue, StringValue } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateStringLiteral(scope: EvaluationScope, expression: StringLiteralExpression): LazyValue<StringValue> {
  let value = expression.tokens[0].value;
  value = value.slice(1, value.length - 1);
  return Observable.of(makeStringValue(value));
}
