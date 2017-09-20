import {
  ArrayValue,
  IntegerValue, makeArrayValue, makeIntegerValue,
  NoneValue,
} from '../../value.model';
import {
  IntegerType, makeArrayType,
  makeFunctionType, makeUnionType, NoneType,
} from '../../type.model';
import { evaluateArguments } from '../prepare-function';
import { LibraryEntry } from '../library';


export function buildRangeFunc(a: IntegerValue | NoneValue, b: IntegerValue | NoneValue): ArrayValue {
  let start: number = a.value !== null ? a.value : 1;
  let end: number = b.value !== null ? b.value : Infinity;

  let index = start;
  let delta = start < end ? 1 : -1;

  let iterate = function* () {
    while (delta > 0 ? index <= end : index >= end) {
      yield makeIntegerValue(index);
      index += delta;
    }
  };
  return makeArrayValue(iterate());
}



export const buildRange: LibraryEntry = {
  type: makeFunctionType([
    makeUnionType([IntegerType, NoneType]),
    makeUnionType([IntegerType, NoneType]),
  ], makeArrayType(IntegerType)),
  impl: evaluateArguments(buildRangeFunc),
};
