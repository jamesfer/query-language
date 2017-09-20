import { TypedIdentifierExpression } from '../../type-expression/typers/identifier';
import { ValueFunction } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

export function evaluateIdentifier(scope: EvaluationScope, expression: TypedIdentifierExpression): ValueFunction {
  return scope[expression.expression.name];
}
