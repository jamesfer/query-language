import 'rxjs/add/observable/from';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { TypedArrayLiteralExpression } from '../../compile/type/typers/array-literal';
import {
  ArrayValue,
  LazyValue,
  makeLazyArrayValue,
  Value,
} from '../../value.model';
import { evaluateExpression } from '../evaluate-expression';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateArrayLiteral(scope: EvaluationScope, expression: TypedArrayLiteralExpression): LazyValue<ArrayValue> {
  let elements = Observable.from(expression.elements)
    .map(element => evaluateExpression(scope, element))
    .filter(element => !!element) as Observable<Observable<Value>>;
  return makeLazyArrayValue(elements.mergeAll());
}
