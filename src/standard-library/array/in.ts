import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/first';
import {
  BooleanType,
  makeArrayType,
  makeFunctionType,
} from '../../type';
import {
  BooleanValue,
  LazyValue,
  makeBooleanValue,
  Value,
} from '../../value';
import { LibraryEntry } from '../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';


function inFunc(item: any, list: Observable<Value>): LazyValue<BooleanValue> {
  return list.first(el => el.value === item, () => true, false)
    .map(makeBooleanValue);
}

export const inArray: LibraryEntry = {
  type: makeFunctionType([ 'T', makeArrayType('T') ], BooleanType),
  impl: evalArgs(inFunc),
};
