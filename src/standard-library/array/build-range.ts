import 'rxjs/add/observable/range';
import { Observable } from 'rxjs/Observable';
import {
  IntegerType,
  makeArrayType,
  makeFunctionType,
  makeUnionType,
  NoneType,
} from '../../type.model';
import {
  ArrayValue,
  LazyValue,
  makeArrayValue,
  makeIntegerValue,
} from '../../value.model';
import { LibraryEntry } from '../library';
import { evalArgs } from '../library-utils';


export function buildRangeFunc(a: number | null, b: number | null): LazyValue<ArrayValue> {
  let start: number = a !== null ? a : 0;
  let end: number = b !== null ? b : Infinity;
  let sign = start < end ? 1 : -1;
  let count = end === Infinity ? Infinity : Math.abs(start - end);
  let arr = Observable.range(0, count)
    .map(val => val * sign + start)
    .map(makeIntegerValue);
  return Observable.of(makeArrayValue(arr));
}



export const buildRange: LibraryEntry = {
  type: makeFunctionType([
    makeUnionType([IntegerType, NoneType]),
    makeUnionType([IntegerType, NoneType]),
  ], makeArrayType(IntegerType)),
  impl: evalArgs(buildRangeFunc),
};
