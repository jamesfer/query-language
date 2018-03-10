import 'rxjs/add/observable/range';
import { Observable } from 'rxjs/Observable';
import {
  ArrayValue,
  LazyValue,
  makeArrayValue,
  makeIntegerValue,
} from '../../value';
import { LibraryEntry } from '../library';
import { evalArgs } from '../library-utils';
import {
  integerType, makeArrayType, makeFunctionType,
} from '../../type/constructors';


export function rangeFunc(a: number | null, b: number | null): LazyValue<ArrayValue> {
  let start: number = a !== null ? a : 0;
  let end: number = b !== null ? b : Infinity;
  let sign = start < end ? 1 : -1;
  let count = end === Infinity ? Infinity : Math.abs(start - end);
  let arr = Observable.range(0, count)
    .map(val => val * sign + start)
    .map(makeIntegerValue);
  return Observable.of(makeArrayValue(arr));
}



export const range: LibraryEntry = {
  type: makeFunctionType([ integerType, integerType ],
    makeArrayType(integerType)),
  impl: evalArgs(rangeFunc),
};
