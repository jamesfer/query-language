import 'rxjs/add/operator/first';
import {
  makeArrayType,
  makeFunctionType,
  makeGenericType,
} from '../../../type.model';
import { ArrayValue, LazyValue, } from '../../../value.model';
import { LibraryEntry } from '../../library';

function headFunc(list: LazyValue<ArrayValue>): LazyValue {
  return list.switchMap(arrValue => arrValue.value.first());
}

export const head: LibraryEntry = {
  type: makeFunctionType([
    makeArrayType(makeGenericType('T'))
  ], makeGenericType('T')),
  impl: headFunc,
};
