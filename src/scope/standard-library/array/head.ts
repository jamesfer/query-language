import 'rxjs/add/operator/first';
import {
  makeArrayType,
  makeFunctionType,
} from '../../../type.model';
import { ArrayValue, LazyValue, } from '../../../value.model';
import { LibraryEntry } from '../../library';
import 'rxjs/add/operator/switchMap';

function headFunc(list: LazyValue<ArrayValue>): LazyValue {
  return list.switchMap(arrValue => arrValue.value.first());
}

export const head: LibraryEntry = {
  type: makeFunctionType([ makeArrayType('T') ], 'T'),
  impl: headFunc,
};
