import { map } from 'lodash';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/switch';
import { Observable } from 'rxjs/Observable';
import {
  FloatValue,
  LazyValue, makeLazyBooleanValue,
  makeLazyFloatValue,
  PlainFunctionValue,
  Value,
} from '../value.model';

export type LibraryFunc = (...args: Value[]) => LazyValue;

/**
 * Returns a function that will automatically evaluate all its lazy arguments
 * and call the given function with them.
 */
export function evalArgs<R extends (Value | LazyValue) = Value>(func: LibraryFunc): PlainFunctionValue {
  return (...args) => Observable.combineLatest(...args, func).switch();
}

export function bindFloatFunction(func: (...args: number[]) => number) {
  return evalArgs((...args: FloatValue[]) => {
    return makeLazyFloatValue(func(...map(args, 'value')))
  });
}

export function bindBooleanFunction(func: (...args: number[]) => boolean) {
  return evalArgs((...args: FloatValue[]) => {
    return makeLazyBooleanValue(func(...map(args, 'value')));
  });
}
