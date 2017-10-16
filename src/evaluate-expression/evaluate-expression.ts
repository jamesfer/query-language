import { TypedExpression } from '../typed-expression.model';
import { assertNever, exhaustIterator } from '../utils';
import { evaluateStringLiteral } from './evaluators/string-literal';
import { evaluateFloatLiteral, evaluateIntegerLiteral } from './evaluators/numeric-literal';
import { evaluateArrayLiteral } from './evaluators/array-literal';
import { evaluateFunctionCall } from './evaluators/function-call';
import { evaluateIdentifier } from './evaluators/identifier';
import { LazyValue, NoneValue, Value, PromiseValue } from '../value.model';
import { EvaluationScope } from './evaluation-scope';
import { map } from 'lodash';

export type PartialPlaceholder = {};

export function evaluateExpression(scope: EvaluationScope, expression: TypedExpression): LazyValue | undefined {
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
    case 'Identifier':
      return evaluateIdentifier(scope, expression);
    case 'NoneLiteral':
      return () => Promise.resolve<NoneValue>({ kind: 'None', value: null });
    case 'Unrecognized':
      return undefined;
    default:
      return assertNever(expression);
  }
}

export function evaluateSyntaxTree(scope: EvaluationScope, expression: TypedExpression): Promise<any> | undefined {
  let lazy = evaluateExpression(scope, expression);
  if (lazy) {
    return stripValue(lazy());
  }
}

export function stripValue(valuePromise: PromiseValue): Promise<any> | undefined {
  return valuePromise.then((valueObj): any => {
    switch (valueObj.kind) {
      case 'Float':
      case 'Integer':
      case 'String':
      case 'Boolean':
      case 'Function':
      case 'None':
        return valueObj.value;
      case 'Array':
        return Promise.all(map(exhaustIterator(valueObj.value), f => stripValue(f)));
      default:
        return assertNever(valueObj);
    }
  });
}
