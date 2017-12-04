import { filter, map, partial } from 'lodash';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { FunctionCallExpression } from '../../expression.model';
import { FunctionType } from '../../type.model';
import { Expression } from '../../expression.model';
import {
  LazyValue,
  makeFunctionValue,
  PlainFunctionValue,
} from '../../value.model';
import { evaluateExpression, PartialPlaceholder } from '../evaluate-expression';
import { EvaluationScope } from '../evaluation-scope';

interface Placeholder {
  (...a: any[]): any;
  placeholder: PartialPlaceholder;
}


function evaluateFunctionExpression(scope: EvaluationScope, expression: Expression): Observable<PlainFunctionValue> {
  // TODO Remove synchronous throws
  let lazyFunc = evaluateExpression(scope, expression);
  if (!lazyFunc) {
    throw new Error('Attempted to call an unrecognized expression.');
  }

  // let promiseFunc = lazyFunc();
  // if (!(promiseFunc instanceof Promise)) {
  //   throw new Error('Attempted to call an array.');
  // }

  return lazyFunc.map(func => {
    if (func.kind !== 'Function') {
      throw new Error('Attempted to call an expression that is not a function');
    }
    // TODO check the result is not null
    // TODO check that value is is a function type
    return func.value;
  });
}

function evaluateArguments(scope: EvaluationScope, expressions: (Expression | null)[]): (LazyValue | PartialPlaceholder)[] {
  // Evaluate each of the arguments
  return map(expressions, (arg): LazyValue | PartialPlaceholder => {
    let result = arg ? evaluateExpression(scope, arg) : null;
    return result || (partial as Placeholder).placeholder;
  });
}

export function evaluateFunctionCall(scope: EvaluationScope, expression: FunctionCallExpression): LazyValue {
  const argCount = filter(expression.args, arg => !!arg).length;
  const arity = (expression.functionExpression.resultType as FunctionType).argTypes.length;

  let func = evaluateFunctionExpression(scope, expression.functionExpression);
  let args = evaluateArguments(scope, expression.args);

  if (argCount === arity) {
    return func.switchMap(f => f(...args as LazyValue[]));
  }
  else if (argCount < arity) {
    return func.map(f => {
      let partialFunc = partial(f, ...args) as PlainFunctionValue;
      return makeFunctionValue(partialFunc);
    });
  }
  else {
    // TODO remove synchronous throw
    throw new Error('Too many arguments');
  }
}
