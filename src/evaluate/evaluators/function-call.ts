import {
  PartialPlaceholder,
  evaluateExpression
} from '../evaluate-expression';
import { TypedFunctionCallExpression } from '../../compile/type/typers/function-call';
import { map, partial, filter } from 'lodash';
import { TypedExpression } from '../../typed-expression.model';
import {
  LazyValue, PlainFunctionValue,
  makeFunctionValue, FunctionValue,
} from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';
import { FunctionType } from '../../type.model';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';

interface Placeholder {
  (...a: any[]): any;
  placeholder: PartialPlaceholder;
}


function evaluateFunctionExpression(scope: EvaluationScope, expression: TypedExpression): Observable<PlainFunctionValue> {
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

function evaluateArguments(scope: EvaluationScope, expressions: (TypedExpression | null)[]): (LazyValue | PartialPlaceholder)[] {
  // Evaluate each of the arguments
  return map(expressions, (arg): LazyValue | PartialPlaceholder => {
    let result = arg ? evaluateExpression(scope, arg) : null;
    return result || (partial as Placeholder).placeholder;
  });
}

export function evaluateFunctionCall(scope: EvaluationScope, expression: TypedFunctionCallExpression): LazyValue {
  const argCount = filter(expression.args, arg => !!arg).length;
  const arity = (expression.functionExpression.resultType as FunctionType).argTypes.length;

  let func = evaluateFunctionExpression(scope, expression.functionExpression);
  let args = evaluateArguments(scope, expression.args);

  if (argCount === arity) {
    return func.switchMap(f => f(...args as LazyValue[]));
  }
  else if (argCount < arity) {
    return func.map(f => {
      let partialFunc = partial(f, args) as PlainFunctionValue;
      return makeFunctionValue(partialFunc);
    });
  }
  else {
    // TODO remove synchronous throw
    throw new Error('Too many arguments');
  }
}
