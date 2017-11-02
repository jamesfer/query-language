import {
  ArrayValue,
  IntegerValue, LazyValue, makeArrayValue, makeIntegerValue,
  NoneValue,
} from '../../../value.model';
import {
  IntegerType, makeArrayType,
  makeFunctionType, makeUnionType, NoneType,
} from '../../../type.model';
import { evaluateArguments } from '../../library-utils';
import { LibraryEntry } from '../../library';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/range';


export function buildRangeFunc(a: IntegerValue | NoneValue, b: IntegerValue | NoneValue): LazyValue<ArrayValue> {
  let start: number = a.value !== null ? a.value : 0;
  let end: number = b.value !== null ? b.value : Infinity;
  let delta = start < end ? 1 : -1;
  let count = end === Infinity ? Infinity : Math.abs(start - end);
  let arr = Observable.range(0, count)
    .map(val => val * delta)
    .map(makeIntegerValue);
  return Observable.of(makeArrayValue(arr));
  // return Observable.create((obs: Observer<number>) => {
  //   while (delta < 0 ? index > end : index < end) {
  //     obs.next(index);
  //     index += delta;
  //   }
  //   obs.complete();
  // }).map(makeArrayValue);
}



export const buildRange: LibraryEntry = {
  type: makeFunctionType([
    makeUnionType([IntegerType, NoneType]),
    makeUnionType([IntegerType, NoneType]),
  ], makeArrayType(IntegerType)),
  impl: evaluateArguments(buildRangeFunc),
};
