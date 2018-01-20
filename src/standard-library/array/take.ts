import {
  makeLazyArrayValue, Value,
} from '../../value';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { evalArgs } from '../library-utils';
import {
  makeArrayType,
  } from '../../type/constructors';
import { LibraryEntry } from '../library';
import { integerType, makeFunctionType } from '../../type/constructors';

function takeFunc(count: number, list: Observable<Value>) {
  return makeLazyArrayValue(list.take(count));
}

export const take: LibraryEntry = {
  type: makeFunctionType([integerType, makeArrayType('T')], 'T'),
  impl: evalArgs(takeFunc),
};
