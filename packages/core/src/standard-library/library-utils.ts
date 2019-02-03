import { map } from 'lodash';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/switch';
import { Observable } from 'rxjs/Observable';
import { NativeFunctionValue } from '../library';
import {
  LazyValue,
  makeLazyBooleanValue,
  makeLazyFloatValue,
  PlainValue,
} from '../value';

/**
 * Returns a function that will automatically evaluate all its lazy arguments
 * and call the given function with values of them.
 */
export function evalArgs(func: (...args: PlainValue[]) => LazyValue): NativeFunctionValue {
  return (...args) => Observable.combineLatest(...args).switchMap((values) => (
    func(...map(values, 'value'))
  ));
}

export function bindFloatFunction(func: (...args: number[]) => number): NativeFunctionValue {
  return evalArgs((...args: number[]) => {
    return makeLazyFloatValue(func(...args));
  });
}

export function bindBooleanFunction(func: (...args: number[]) => boolean): NativeFunctionValue {
  return evalArgs((...args: number[]) => {
    return makeLazyBooleanValue(func(...args));
  });
}
