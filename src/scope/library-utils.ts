import { map } from 'lodash';
import {
  FloatValue,
  PlainFunctionValue, Value,
  makeFloatValue, PromiseValue,
} from '../value.model';

export type LibraryFunc = (...args: Value[]) => PromiseValue | Value;

export function evaluateArguments<R extends (Value | PromiseValue) = Value>(func: LibraryFunc): PlainFunctionValue {
  return (...args) => {
    return Promise.all(map(args, a => a()))
      .then(plainArgs => func(...plainArgs));
  }
}

export function bindFloatFunction(func: (...args: number[]) => number) {
  return evaluateArguments((...args: FloatValue[]) => {
    return makeFloatValue(func(...map(args, 'value')))
  });
}
