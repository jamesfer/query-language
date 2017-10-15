import { evaluateExpression } from '../evaluate-expression';
import { TypedArrayLiteralExpression } from '../../type-expression/typers/array-literal';
import { TypedExpression } from '../../typed-expression.model';
import {
  ArrayValue, LazyValue, makeLazyArrayValue,
  Value,
} from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

function* iterateElements(scope: EvaluationScope, elements: TypedExpression[]): Iterator<Promise<Value>> {
  let index = -1;
  while (++index < elements.length) {
    let val = evaluateExpression(scope, elements[index]);
    if (val !== undefined) {
      yield val();
    }
  }
}

export function evaluateArrayLiteral(scope: EvaluationScope, expression: TypedArrayLiteralExpression): LazyValue<ArrayValue> {
  return makeLazyArrayValue(iterateElements(scope, expression.elements));
}
