import { TypedStringLiteralExpression } from '../../type-expression/typers/string-literal';
import {
  StringValue, LazyValue,
  makeLazyStringValue,
} from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateStringLiteral(scope: EvaluationScope, expression: TypedStringLiteralExpression): LazyValue<StringValue> {
  let value = expression.expression.tokens[0].value;
  value = value.slice(1, value.length - 1);
  return makeLazyStringValue(value);
}
