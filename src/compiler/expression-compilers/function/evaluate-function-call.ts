import { Dictionary, filter, map, partial, isFunction, pick, mapValues } from 'lodash';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { FunctionCallExpression } from '../../../expression';
import { Scope } from '../../../scope';
import { FunctionType, Type } from '../../../type/type';
import { Expression } from '../../../expression';
import {
  LazyValue,
  makeMethodValue, makeFunctionValue,
  PlainFunctionValue,
} from '../../../value';
import { evaluateExpression, PartialPlaceholder } from '../../evaluate-expression';

interface Placeholder {
  (...a: any[]): any;
  placeholder: PartialPlaceholder;
}


function evaluateFunctionExpression(scope: Scope, expression: Expression): Observable<PlainFunctionValue> {
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
    // TODO check the result is not null
    // TODO check that value is is a function type
    if (func.kind === 'Function') {
      return func.value;
    }
    throw new Error('Attempted to call an expression that is not a function');
  });
}

function evaluateArguments(scope: Scope, expressions: (Expression | null)[]): (LazyValue | PartialPlaceholder)[] {
  // Evaluate each of the arguments
  return map(expressions, (arg): LazyValue | PartialPlaceholder => {
    let result = arg ? evaluateExpression(scope, arg) : null;
    return result || (partial as Placeholder).placeholder;
  });
}

function getArity(type: Type | null): number {
  return type && type.kind === 'Function' ? type.argTypes.length : 0;
}

export function evaluateFunctionCall(scope: Scope, expression: FunctionCallExpression): LazyValue {
  const argCount = filter(expression.args, arg => !!arg).length;
  const arity = getArity(expression.functionExpression.resultType);

  let lazyFuncs = evaluateFunctionExpression(scope, expression.functionExpression);
  let args = evaluateArguments(scope, expression.args);

  if (argCount > arity) {
    // TODO remove synchronous throw
    throw new Error('Too many arguments');
  }

  return lazyFuncs.switchMap(funcs => {
    // funcs is a plain function
    // if (isFunction(funcs)) {
      if (argCount === arity) {
        return funcs(...args as LazyValue[]);
      }
      let partialFunc = partial(funcs, ...args) as PlainFunctionValue;
      return Observable.of(makeFunctionValue(partialFunc));
    // }


    // funcs is a method
    // const implementations = expression.methodImplementations;
    // if (!implementations) {
    //   throw new Error('Attempted to evaluate a method without identifying any method implementations. This should never happen.');
    // }
    //
    // if (implementations.length === 0) {
    //   throw new Error('Attempted to evaluate a method that has no matching implementations');
    // }
    //
    // if (argCount === arity) {
    //   if (implementations.length !== 1) {
    //     throw new Error(
    //       'Attempted to evaluate a method that had all arguments filled but still could not be narrowed to a single implementation');
    //   }
    //
    //   const selectedImplementation = funcs[implementations[0]];
    //   if (!selectedImplementation) {
    //     throw new Error('During typing a signature was selected that did not have a corresponding implementation');
    //   }
    //   return selectedImplementation(...args as LazyValue[]);
    // }
    //
    // const selectedImplementations = pick<Dictionary<PlainFunctionValue>, Dictionary<PlainFunctionValue>>(funcs, implementations);
    // const partialedImplementations = mapValues(selectedImplementations, impl => {
    //   return partial(impl, ...args) as PlainFunctionValue;
    // });
    // return Observable.of(makeMethodValue(partialedImplementations))
  });
}
