import { TypedExpression } from '../typed-expression.model';
import { assertNever, exhaustIterator } from '../utils';
import { evaluateStringLiteral } from './evaluators/string-literal';
import { evaluateFloatLiteral, evaluateIntegerLiteral } from './evaluators/numeric-literal';
import { map } from 'lodash';
import { evaluateArrayLiteral } from './evaluators/array-literal';
import { evaluateFunctionCall } from './evaluators/function-call';
import { evaluateIdentifier } from './evaluators/identifier';
import { ValueFunction, Value } from '../value.model';
// import { evaluateParenthesis } from './evaluators/parenthesis';
import { EvaluationScope } from './evaluation-scope';

export type PartialPlaceholder = {};

export function evaluateExpression(scope: EvaluationScope, expression: TypedExpression): ValueFunction | undefined {
  switch (expression.kind) {
    case 'StringLiteral':
      return evaluateStringLiteral(scope, expression);
    case 'IntegerLiteral':
      return evaluateIntegerLiteral(scope, expression);
    case 'FloatLiteral':
      return evaluateFloatLiteral(scope, expression);
    case 'ArrayLiteral':
      return evaluateArrayLiteral(scope, expression);
    case 'FunctionCall':
      return evaluateFunctionCall(scope, expression);
    // case 'Parenthesis':
    //   return evaluateParenthesis(scope, expression);
    case 'Identifier':
      return evaluateIdentifier(scope, expression);
    case 'NoneLiteral':
      return () => ({ kind: 'None', value: null });
    case 'Unrecognized':
      return undefined;
    default:
      return assertNever(expression);
  }
}

export function evaluateSyntaxTree(scope: EvaluationScope, expression: TypedExpression): any {
  const value = evaluateExpression(scope, expression);
  return value ? stripValue(value()) : undefined;
}

export function stripValue(val: Value): any {
  switch (val.kind) {
    case 'Float':
    case 'Integer':
    case 'String':
    case 'Boolean':
      return val.value;
    case 'Function':
      return undefined;
    case 'Array':
      return map(exhaustIterator(val.value), f => stripValue(f));
    case 'None':
      return null;
    default:
      return assertNever(val);
  }
}
