import { TypedIdentifierExpression } from '../../typed-expression.model';
import { LazyValue } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateIdentifier(scope: EvaluationScope, expression: TypedIdentifierExpression): LazyValue {
  return scope[expression.expression.value];
}
