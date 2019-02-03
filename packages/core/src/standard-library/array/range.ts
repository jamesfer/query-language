import 'rxjs/add/observable/range';
import { Observable } from 'rxjs/Observable';
import { ArrayValue, LazyValue, makeArrayValue, makeIntegerValue } from '../../value';
import { NativeFunction } from '../../library';
import { evalArgs } from '../library-utils';
import { integerType, makeArrayType, makeFunctionType } from '../../type/constructors';
import 'rxjs/add/operator/map';

export function rangeFunc(start: number, end: number): LazyValue<ArrayValue> {
  const sign = start < end ? 1 : -1;
  const count = end === Infinity ? Infinity : Math.abs(start - end);
  const arr = Observable.range(0, count)
    .map(val => val * sign + start)
    .map(makeIntegerValue);
  return Observable.of(makeArrayValue(arr));
}

export const range: NativeFunction = {
  type: makeFunctionType(
    [],
    [integerType, integerType],
    makeArrayType(integerType),
  ),
  implementation: evalArgs(rangeFunc),
};
