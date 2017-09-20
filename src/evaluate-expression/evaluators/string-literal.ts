import { TypedStringLiteralExpression } from '../../type-expression/typers/string-literal';
import { StringValue, ValueFunction } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateStringLiteral(scope: EvaluationScope, expression: TypedStringLiteralExpression): ValueFunction<StringValue> {
  let value = expression.expression.tokens[0].value;
  value = value.slice(1, value.length - 1);
  return () => ({
    kind: 'String',
    value,
  });
}
