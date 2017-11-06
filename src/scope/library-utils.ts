import { map } from 'lodash';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/switch';
import { Observable } from 'rxjs/Observable';
import {
  FloatValue,
  LazyValue,
  makeLazyFloatValue,
  PlainFunctionValue,
  Value,
} from '../value.model';

export type LibraryFunc = (...args: Value[]) => LazyValue;

export function evaluateArguments<R extends (Value | LazyValue) = Value>(func: LibraryFunc): PlainFunctionValue {
  return (...args) => Observable.combineLatest(...args, func).switch();
}

export function bindFloatFunction(func: (...args: number[]) => number) {
  return evaluateArguments((...args: FloatValue[]) => {
    return makeLazyFloatValue(func(...map(args, 'value')))
  });
}
