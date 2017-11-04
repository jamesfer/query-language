import {
  ArrayValue, LazyValue, makeArrayValue,
} from '../../../value.model';
import {
  makeArrayType, makeFunctionType,
  makeGenericType,
} from '../../../type.model';
import { LibraryEntry } from '../../library';
import 'rxjs/add/operator/first'

function headFunc(list: LazyValue<ArrayValue>): LazyValue {
  return list.switchMap(arrValue => arrValue.value.first());
}

export const head: LibraryEntry = {
  type: makeFunctionType([
    makeArrayType(makeGenericType('T'))
  ], makeGenericType('T')),
  impl: headFunc,
};
