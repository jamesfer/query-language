import 'rxjs/add/operator/first';
import { NativeFunction } from '../../library';
import { makeArrayType, makeFunctionType } from '../../type/constructors';
import { ArrayValue, LazyValue } from '../../value';
import 'rxjs/add/operator/switchMap';

function headFunc(list: LazyValue<ArrayValue>): LazyValue {
  return list.switchMap(arrValue => arrValue.value.first());
}

export const head: NativeFunction = {
  type: makeFunctionType([], [makeArrayType('T')], 'T'),
  implementation: headFunc,
};
