import { fromPairs, map } from 'lodash';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { Observable } from 'rxjs/Observable';
import { Expression } from '../expression.model';
import { assertNever } from '../utils';
import { LazyNoneValue, LazyValue, Value } from '../value.model';
import { EvaluationScope } from './evaluation-scope';
import { evaluateArrayLiteral } from './evaluators/array-literal';
import { evaluateFunctionCall } from './evaluators/function-call';
import {
  evaluateBooleanLiteral,
  evaluateIdentifier,
  evaluateIntegerLiteral, evaluateStringLiteral,
} from './evaluators/simple-expressions';
import {
  evaluateFloatLiteral,
  } from './evaluators/simple-expressions';

export type PartialPlaceholder = {};

export function evaluateExpression(scope: EvaluationScope, expression: Expression): LazyValue | undefined {
  switch (expression.kind) {
    case 'String':
      return evaluateStringLiteral(scope, expression);
    case 'Integer':
      return evaluateIntegerLiteral(scope, expression);
    case 'Float':
      return evaluateFloatLiteral(scope, expression);
    case 'Boolean':
      return evaluateBooleanLiteral(scope, expression);
    case 'Array':
      return evaluateArrayLiteral(scope, expression);
    case 'FunctionCall':
      return evaluateFunctionCall(scope, expression);
    case 'Identifier':
      return evaluateIdentifier(scope, expression);
    case 'None':
      return LazyNoneValue;
    case 'Unrecognized':
      return undefined;
    default:
      return assertNever(expression);
  }
}

export function evaluateSyntaxTree(scope: EvaluationScope, expression: Expression): Observable<any> | undefined {
  let lazyValue = evaluateExpression(scope, expression);
  if (lazyValue) {
    return stripLazyValue(lazyValue);
  }
}

export function stripLazyValue(lazyValue: LazyValue): Observable<any> | undefined {
  return lazyValue.map(stripValue).mergeAll();
}

export function stripValue(value: Value): Observable<any> {
  switch (value.kind) {
    case 'Float':
    case 'Integer':
    case 'String':
    case 'Boolean':
    case 'Function':
    case 'None':
      return Observable.of(value.value);
    case 'Array':
      return value.value.mergeMap(stripValue).toArray();
    case 'Record':
      let properties = map(value.value, (property, key) => {
        return stripValue(property).map(stripped => [key, stripped]);
      });
      return Observable.combineLatest(properties).map(fromPairs);
    default:
      return assertNever(value);
  }
}
