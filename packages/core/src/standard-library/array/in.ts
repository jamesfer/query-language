import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import { booleanType, makeArrayType, makeFunctionType } from '../../type/constructors';
import { BooleanValue, LazyValue, makeBooleanValue, Value } from '../../value';
import { LibraryFunction } from '../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';

function inImpl(item: any, list: Observable<Value>): LazyValue<BooleanValue> {
  return list.first(el => el.value === item, () => true, false)
    .map(makeBooleanValue);
}

export const inFunc: LibraryFunction = {
  type: makeFunctionType(['T', makeArrayType('T')], booleanType),
  impl: evalArgs(inImpl),
};
