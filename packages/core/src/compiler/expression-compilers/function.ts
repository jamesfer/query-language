import { Expression, FunctionExpression, } from '../../expression';
import { Scope } from '../../scope';
import {
  LazyValue,
  FunctionValue, PlainFunctionValue, LazyNoneValue,
} from '../../value';
import { Observable } from 'rxjs/Observable';
import { isFunction, zipObject, merge } from 'lodash';
import { evaluateExpression } from '../evaluate-expression';


// export function interpretFunction(tokens: Token[]): UntypedFunctionExpression | undefined {
//   if (tokenArrayMatches(tokens, ...)) {
//
//   }
// }

// export function typeFunction(scope: Scope, expression: UntypedFunctionExpression): FunctionExpression {
//   return ...;
// }

function isFunctionValue(value: FunctionValue | Expression): value is FunctionValue {
  return value.kind === 'Function' && isFunction(value.value);
}

export function evaluateFunction(scope: Scope, expression: FunctionExpression): LazyValue<FunctionValue> {
  // Check if the value is a native function
  const funcValue = expression.value;
  if (isFunctionValue(funcValue)) {
    return Observable.of(funcValue);
  }

  // const funcType = expression.resultType;
  // if (!funcType || funcType.kind !== 'Function') {
  //   throw new Error('Tried to evaluate a function expression that was not a function');
  // }

  // Convert an expression into a function
  const expressionFunction: PlainFunctionValue = (...args) => {
    const argumentValues = zipObject(expression.argumentNames, args);
    const functionScope = merge({}, scope, { values: argumentValues });
    return Observable.of(evaluateExpression(functionScope, funcValue))
      .switchMap(value => value === undefined ? LazyNoneValue : value);
  };
  const functionValue: FunctionValue = {
    kind: 'Function',
    value: expressionFunction
  };
  return Observable.of(functionValue);
}
