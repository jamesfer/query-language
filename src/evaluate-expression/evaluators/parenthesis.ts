import {
  evaluateExpression,
} from '../evaluate-expression';
import { ValueFunction } from '../../value.model';
import { TypedParenthesisExpression } from '../../type-expression/typers/parenthesis';
import { EvaluationScope } from '../evaluation-scope';


export function evaluateParenthesis(scope: EvaluationScope, expression: TypedParenthesisExpression): ValueFunction {
  let internalValue = evaluateExpression(scope, expression.internalExpression);
  if (!internalValue) {
    throw new Error('Invalid expression inside parenthesis');
  }
  return internalValue;
}
