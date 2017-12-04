import { IdentifierExpression } from '../../expression.model';
import { LazyValue } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateIdentifier(scope: EvaluationScope, expression: IdentifierExpression): LazyValue {
  return scope[expression.expression.value];
}
