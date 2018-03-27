import { map } from 'lodash';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/switch';
import { Observable } from 'rxjs/Observable';
import {
  LazyValue,
  makeLazyBooleanValue,
  makeLazyFloatValue,
  PlainFunctionValue,
  PlainValue,
} from '../value';

/**
 * Returns a function that will automatically evaluate all its lazy arguments
 * and call the given function with values of them.
 */
export function evalArgs(func: (...args: PlainValue[]) => LazyValue): PlainFunctionValue {
  return (...args) => Observable.combineLatest(...args, (...values) => {
    return func(...map(values, 'value'));
  }).switch();
}

export function bindFloatFunction(func: (...args: number[]) => number): PlainFunctionValue {
  return evalArgs((...args: number[]) => {
    return makeLazyFloatValue(func(...args));
  });
}

export function bindBooleanFunction(func: (...args: number[]) => boolean): PlainFunctionValue {
  return evalArgs((...args: number[]) => {
    return makeLazyBooleanValue(func(...args));
  });
}
