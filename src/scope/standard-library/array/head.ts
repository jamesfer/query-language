import { ArrayValue, LazyValue, PromiseValue } from '../../../value.model';
import {
  makeArrayType, makeFunctionType,
  makeGenericType,
} from '../../../type.model';
import { LibraryEntry } from '../../library';

function headFunc(list: LazyValue<ArrayValue>): PromiseValue {
  return list().then(arr => arr.value.next().value);
}

export const head: LibraryEntry = {
  type: makeFunctionType([
    makeArrayType(makeGenericType('T'))
  ], makeGenericType('T')),
  impl: headFunc,
};
