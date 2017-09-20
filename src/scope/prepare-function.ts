import { map } from 'lodash';
import {
  FloatValue,
  PlainFunctionValue, Value,
  ValueFunction,
  makeFloatValue,
} from '../value.model';

export type LibraryFunc<R> = (...args: Value[]) => R;

function createLibraryFunctionWrap<R>(
  kind: string,
): (func: LibraryFunc<R>) => PlainFunctionValue {
  return (libraryFunction) => {
    return (...evaluatedArgs: ValueFunction[]): Value => {
      return {
        kind,
        value: libraryFunction(...map(evaluatedArgs, arg => arg())) as any,
      } as Value;
    };
  };
}

export const wrapIntegerLibraryFunction = createLibraryFunctionWrap<number>('Integer');
export const wrapFloatLibraryFunction = createLibraryFunctionWrap<number>('Float');
export const wrapBooleanLibraryFunction = createLibraryFunctionWrap<boolean>('Boolean');
export const wrapNoneLibraryFunction = createLibraryFunctionWrap<null>('None');
export const wrapArrayLibraryFunction = createLibraryFunctionWrap<Iterator<Value>>('Array');

export function evaluateArguments(func: LibraryFunc<Value>): PlainFunctionValue {
  return (...args: ValueFunction[]): Value => func(...map(args, arg => arg()));
}

export function bindFloatFunction(func: (...args: number[]) => number)
: (...args: ValueFunction<FloatValue>[]) => FloatValue {
  return (...args) => makeFloatValue(func(...map(args, a => a().value)));
}
