import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import { booleanType, makeArrayType, makeFunctionType } from '../../type/constructors';
import { BooleanValue, LazyValue, makeBooleanValue, Value } from '../../value';
import { NativeFunction } from '../../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';

function inImpl(item: any, list: Observable<Value>): LazyValue<BooleanValue> {
  return list.first(el => el.value === item, () => true, false)
    .map(makeBooleanValue);
}

export const inFunc: NativeFunction = {
  type: makeFunctionType([], ['T', makeArrayType('T')], booleanType),
  implementation: evalArgs(inImpl),
};
