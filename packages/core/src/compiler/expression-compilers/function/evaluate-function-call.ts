import { filter, map, partial } from 'lodash';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Expression, FunctionCallExpression } from '../../../expression';
import { Scope } from '../../../scope';
import { Type } from '../../../type/type';
import { LazyValue, makeFunctionValue, PlainFunctionValue } from '../../../value';
import { evaluateExpression, PartialPlaceholder } from '../../evaluate-expression';

interface Placeholder {
  (...a: any[]): any;
  placeholder: PartialPlaceholder;
}


function evaluateFunctionExpression(scope: Scope, expression: Expression)
: Observable<PlainFunctionValue> {
  // TODO Remove synchronous throws
  const lazyFunc = evaluateExpression(scope, expression);
  if (!lazyFunc) {
    throw new Error('Attempted to call an unrecognized expression.');
  }

  // let promiseFunc = lazyFunc();
  // if (!(promiseFunc instanceof Promise)) {
  //   throw new Error('Attempted to call an array.');
  // }

  return lazyFunc.map((func) => {
    // TODO check the result is not null
    // TODO check that value is is a function type
    if (func.kind === 'Function') {
      return func.value;
    }
    throw new Error('Attempted to call an expression that is not a function');
  });
}

function evaluateArguments(scope: Scope, expressions: (Expression | null)[])
: (LazyValue | PartialPlaceholder)[] {
  // Evaluate each of the arguments
  return map(expressions, (arg): LazyValue | PartialPlaceholder => {
    const result = arg ? evaluateExpression(scope, arg) : null;
    return result || (partial as Placeholder).placeholder;
  });
}

function getArity(type: Type | null): number {
  return type && type.kind === 'Function' ? type.argTypes.length : 0;
}

export function evaluateFunctionCall(scope: Scope, expression: FunctionCallExpression): LazyValue {
  const argCount = filter(expression.args, arg => !!arg).length;
  const arity = getArity(expression.functionExpression.resultType);

  const lazyFuncs = evaluateFunctionExpression(scope, expression.functionExpression);
  const args = evaluateArguments(scope, expression.args);

  if (argCount > arity) {
    // TODO remove synchronous throw
    throw new Error('Too many arguments');
  }

  return lazyFuncs.switchMap((funcs) => {
    if (argCount === arity) {
      return funcs(...args as LazyValue[]);
    }
    const partialFunc = partial(funcs, ...args) as PlainFunctionValue;
    return Observable.of(makeFunctionValue(partialFunc));
  });
}
