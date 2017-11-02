import { map } from 'lodash';
import {
  FloatValue,
  PlainFunctionValue, Value,
  LazyValue, makeLazyFloatValue,
} from '../value.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/switch';

export type LibraryFunc = (...args: Value[]) => LazyValue;

export function evaluateArguments<R extends (Value | LazyValue) = Value>(func: LibraryFunc): PlainFunctionValue {
  return (...args) => Observable.combineLatest(...args, func).switch();
}

export function bindFloatFunction(func: (...args: number[]) => number) {
  return evaluateArguments((...args: FloatValue[]) => {
    return makeLazyFloatValue(func(...map(args, 'value')))
  });
}
