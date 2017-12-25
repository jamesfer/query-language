import {
  ArrayValue, FloatValue, IntegerValue,
  LazyValue, makeArrayValue,
} from '../../../value.model';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { evalArgs } from '../../library-utils';
import {
  IntegerType, makeArrayType,
  makeFunctionType,
} from '../../../type.model';
import { LibraryEntry } from '../../library';

function takeFunc(count: IntegerValue, list: ArrayValue): LazyValue<ArrayValue> {
  return Observable.of(makeArrayValue(list.value.take(count.value)));
}

export const take: LibraryEntry = {
  type: makeFunctionType([IntegerType, makeArrayType('T')], 'T'),
  impl: evalArgs(takeFunc),
};
