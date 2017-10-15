import { map } from 'lodash';
import {
  FloatValue,
  PlainFunctionValue, Value,
  LazyValue,
  makeFloatValue, PlainValue, makeLazy, makeLazyFunctionValue,
} from '../value.model';

export type LibraryFunc<R> = (...args: Value[]) => R;

function createLibraryFunctionWrap<R extends PlainValue>(
  kind: string,
): (func: LibraryFunc<R>) => PlainFunctionValue {
  return libraryFunction => {
    return (...evaluatedArgs: LazyValue[]) => {
      return () => Promise.all(map(evaluatedArgs, a => a()))
        .then(args => ({
          kind,
          value: libraryFunction(...args) as any
        } as Value));
    };
  };
}

export const wrapIntegerLibraryFunction = createLibraryFunctionWrap<number>('Integer');
export const wrapFloatLibraryFunction = createLibraryFunctionWrap<number>('Float');
export const wrapBooleanLibraryFunction = createLibraryFunctionWrap<boolean>('Boolean');
export const wrapNoneLibraryFunction = createLibraryFunctionWrap<null>('None');
export const wrapArrayLibraryFunction = createLibraryFunctionWrap<Iterator<Promise<Value>>>('Array');

// Keeping
export function evaluateArguments<R extends Value = Value>(func: LibraryFunc<R>): PlainFunctionValue<R> {
  return (...args: LazyValue[]): LazyValue<R> => {
    return () => Promise.all(map(args, a => a()))
      .then(plainArgs => func(...plainArgs));
  }
}

// Keeping
export function bindFloatFunction(func: (...args: number[]) => number) {
  return evaluateArguments((...args: FloatValue[]) => {
    return makeFloatValue(func(...map(args, 'value')))
  });
}

// Keeping
export function valueOf<V extends Value>(lazy: LazyValue<V>) {
  return lazy().then(val => val.value);
}
