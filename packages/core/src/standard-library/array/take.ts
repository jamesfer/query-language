import { makeLazyArrayValue, Value } from '../../value';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { evalArgs } from '../library-utils';
import { integerType, makeArrayType, makeFunctionType } from '../../type/constructors';
import { LibraryFunction } from '../library';

function takeFunc(count: number, list: Observable<Value>) {
  return makeLazyArrayValue(list.take(count));
}

export const take: LibraryFunction = {
  type: makeFunctionType([integerType, makeArrayType('T')], 'T'),
  impl: evalArgs(takeFunc),
};
