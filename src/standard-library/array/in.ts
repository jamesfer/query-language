import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import {
  makeArrayType,
  } from '../../type/constructors';
import {
  BooleanValue,
  LazyValue,
  makeBooleanValue,
  Value,
} from '../../value';
import { LibraryEntry } from '../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';
import { booleanType, makeFunctionType } from '../../type/constructors';


function inFunc(item: any, list: Observable<Value>): LazyValue<BooleanValue> {
  return list.first(el => el.value === item, () => true, false)
    .map(makeBooleanValue);
}

export const _in: LibraryEntry = {
  type: makeFunctionType([ 'T', makeArrayType('T') ], booleanType),
  impl: evalArgs(inFunc),
};
