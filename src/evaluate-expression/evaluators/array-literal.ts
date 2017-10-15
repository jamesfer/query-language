import { evaluateExpression } from '../evaluate-expression';
import { TypedArrayLiteralExpression } from '../../type-expression/typers/array-literal';
import { TypedExpression } from '../../typed-expression.model';
import { ArrayValue, Value, LazyValue } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

function* iterateElements(scope: EvaluationScope, elements: TypedExpression[]): Iterator<Value> {
  let index = -1;
  while (++index < elements.length) {
    let val = evaluateExpression(scope, elements[index]);
    if (val !== undefined) {
      yield val();
    }
  }
}

export function evaluateArrayLiteral(scope: EvaluationScope, expression: TypedArrayLiteralExpression): LazyValue<ArrayValue> {
  let value = iterateElements(scope, expression.elements);
  return () => ({
    kind: 'Array',
    value,
  });
}
