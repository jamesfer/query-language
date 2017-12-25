import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/first';
import {
  BooleanType,
  makeArrayType,
  makeFunctionType,
} from '../../../type.model';
import {
  ArrayValue,
  BooleanValue,
  LazyValue,
  makeBooleanValue,
  Value,
} from '../../../value.model';
import { LibraryEntry } from '../../library';
import { evalArgs } from '../../library-utils';


function inFunc(item: Value, list: ArrayValue): LazyValue<BooleanValue> {
  return list.value.first(el => el.value === item.value, () => true, false)
    .map(makeBooleanValue);
}

export const inArray: LibraryEntry = {
  type: makeFunctionType([ 'T', makeArrayType('T') ], BooleanType),
  impl: evalArgs(inFunc),
};
