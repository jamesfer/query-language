import { of } from 'rxjs/observable/of';
import { makeArrayType, makeFunctionType } from '../../type/constructors';
import { makeLazyArrayValue, PlainFunctionValue, Value } from '../../value';
import { LibraryFunction } from '../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';

function mapFunc(func: PlainFunctionValue, list: Observable<Value>) {
  return makeLazyArrayValue(list.switchMap(value => func(of(value))));
}

export const map: LibraryFunction = {
  type: makeFunctionType([
    makeFunctionType(['T'], 'R'),
    makeArrayType('T'),
  ],                     makeArrayType('T')),
  impl: evalArgs(mapFunc),
};
