import { fromPairs, map } from 'lodash';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { Expression } from '../expression';
import { Scope } from '../scope';
import { assertNever } from '../utils';
import { lazyNoneValue, LazyValue, Value } from '../value';
import { evaluateArray } from './expression-compilers/array';
import { evaluateFunctionCall } from './expression-compilers/function/evaluate-function-call';
import { evaluateBoolean } from './expression-compilers/boolean';
import { evaluateFloat, evaluateInteger } from './expression-compilers/number';
import { evaluateIdentifier } from './expression-compilers/identifier';
import { evaluateString } from './expression-compilers/string';
import { evaluateFunction } from './expression-compilers/function';

export type PartialPlaceholder = {};

export function evaluateExpression(scope: Scope, expression: Expression): LazyValue | undefined {
  switch (expression.kind) {
    case 'String':
      return evaluateString(scope, expression);
    case 'Integer':
      return evaluateInteger(scope, expression);
    case 'Float':
      return evaluateFloat(scope, expression);
    case 'Boolean':
      return evaluateBoolean(scope, expression);
    case 'Array':
      return evaluateArray(scope, expression);
    case 'Function':
      return evaluateFunction(scope, expression);
    case 'Method':
      throw new Error('Cannot evaluate a method');
    case 'FunctionCall':
      return evaluateFunctionCall(scope, expression);
    case 'Identifier':
      return evaluateIdentifier(scope, expression);
    case 'None':
      return lazyNoneValue;
    case 'Unrecognized':
      return undefined;
    default:
      return assertNever(expression);
  }
}

export function stripValue(value: Value): Observable<any> {
  switch (value.kind) {
    case 'Float':
    case 'Integer':
    case 'String':
    case 'Boolean':
    case 'Function':
    case 'Method':
    case 'None':
      return Observable.of(value.value);
    case 'Array':
      return value.value.mergeMap(stripValue).toArray();
    case 'Record':
      const properties = map(value.value, (property, key) => {
        return stripValue(property).map(stripped => [key, stripped]);
      });
      return Observable.combineLatest(properties).map(fromPairs);
    default:
      return assertNever(value);
  }
}

export function stripLazyValue(lazyValue: LazyValue): Observable<any> | undefined {
  return lazyValue.map(stripValue).mergeAll();
}

export function evaluateSyntaxTree(scope: Scope, expression: Expression)
: Observable<any> | undefined {
  const lazyValue = evaluateExpression(scope, expression);
  if (lazyValue) {
    return stripLazyValue(lazyValue);
  }
}
