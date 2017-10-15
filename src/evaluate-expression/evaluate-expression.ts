import { TypedExpression } from '../typed-expression.model';
import { assertNever, exhaustIterator } from '../utils';
import { evaluateStringLiteral } from './evaluators/string-literal';
import { evaluateFloatLiteral, evaluateIntegerLiteral } from './evaluators/numeric-literal';
import { evaluateArrayLiteral } from './evaluators/array-literal';
import { evaluateFunctionCall } from './evaluators/function-call';
import { evaluateIdentifier } from './evaluators/identifier';
import { LazyValue, NoneValue, Value } from '../value.model';
import { EvaluationScope } from './evaluation-scope';

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
    return lazy().then((valueObj: Value): any => {
      const value = valueObj.value;
      if (typeof value === "object" && value !== null) {
        return Promise.all<Value>(exhaustIterator(value));
      }
      return value;
    });
  }
}

// export function stripValue(val: Value): any {
//   switch (val.kind) {
//     case 'Float':
//     case 'Integer':
//     case 'String':
//     case 'Boolean':
//       return val.value;
//     case 'Function':
//       return undefined;
//     // case 'Array':
//     //   return map(exhaustIterator(val.value), f => stripValue(f));
//     case 'None':
//       return null;
//     default:
//       return assertNever(val);
//   }
// }
