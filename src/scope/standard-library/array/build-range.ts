import 'rxjs/add/observable/range';
import { Observable } from 'rxjs/Observable';
import {
  IntegerType,
  makeArrayType,
  makeFunctionType,
  makeUnionType,
  NoneType,
} from '../../../type.model';
import {
  ArrayValue,
  IntegerValue,
  LazyValue,
  makeArrayValue,
  makeIntegerValue,
  NoneValue,
} from '../../../value.model';
import { LibraryEntry } from '../../library';
import { evaluateArguments } from '../../library-utils';


export function buildRangeFunc(a: IntegerValue | NoneValue, b: IntegerValue | NoneValue): LazyValue<ArrayValue> {
  let start: number = a.value !== null ? a.value : 0;
  let end: number = b.value !== null ? b.value : Infinity;
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
  impl: evaluateArguments(buildRangeFunc),
};
