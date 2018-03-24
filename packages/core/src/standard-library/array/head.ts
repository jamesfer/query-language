import 'rxjs/add/operator/first';
import {
  makeArrayType,
  } from '../../type/constructors';
import { ArrayValue, LazyValue, } from '../../value';
import { LibraryFunction } from '../library';
import 'rxjs/add/operator/switchMap';
import { makeFunctionType } from '../../type/constructors';

function headFunc(list: LazyValue<ArrayValue>): LazyValue {
  return list.switchMap(arrValue => arrValue.value.first());
}

export const head: LibraryFunction = {
  type: makeFunctionType([ makeArrayType('T') ], 'T'),
  impl: headFunc,
};
