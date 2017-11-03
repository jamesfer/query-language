import { TypedExpression } from '../typed-expression.model';
import { assertNever } from '../utils';
import { evaluateStringLiteral } from './evaluators/string-literal';
import { evaluateFloatLiteral, evaluateIntegerLiteral } from './evaluators/numeric-literal';
import { evaluateArrayLiteral } from './evaluators/array-literal';
import { evaluateFunctionCall } from './evaluators/function-call';
import { evaluateIdentifier } from './evaluators/identifier';
import { LazyValue, LazyNoneValue } from '../value.model';
import { EvaluationScope } from './evaluation-scope';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/toArray';

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
      return LazyNoneValue;
    case 'Unrecognized':
      return undefined;
    default:
      return assertNever(expression);
  }
}

export function evaluateSyntaxTree(scope: EvaluationScope, expression: TypedExpression): Observable<any> | undefined {
  let lazyValue = evaluateExpression(scope, expression);
  if (lazyValue) {
    return stripValue(lazyValue);
  }
}

export function stripValue(lazyValue: LazyValue): any | undefined {
  return lazyValue.map(value => {
    switch (value.kind) {
      case 'Float':
      case 'Integer':
      case 'String':
      case 'Boolean':
      case 'Function':
      case 'None':
        return Observable.of(value.value);
      case 'Array':
        return value.value.toArray();
      default:
        return assertNever(value);
    }
  }).mergeAll();
}
