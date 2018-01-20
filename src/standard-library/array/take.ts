import {
  makeLazyArrayValue, Value,
} from '../../value';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { evalArgs } from '../library-utils';
import {
  IntegerType, makeArrayType,
  makeFunctionType,
} from '../../type/type';
import { LibraryEntry } from '../library';

function takeFunc(count: number, list: Observable<Value>) {
  return makeLazyArrayValue(list.take(count));
}

export const take: LibraryEntry = {
  type: makeFunctionType([IntegerType, makeArrayType('T')], 'T'),
  impl: evalArgs(takeFunc),
};
