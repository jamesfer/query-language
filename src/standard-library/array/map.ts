import { of } from 'rxjs/observable/of';
import {
  makeArrayType,
  } from '../../type/constructors';
import {
  makeLazyArrayValue, PlainFunctionValue, Value,
} from '../../value';
import { LibraryEntry } from '../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';
import { makeFunctionType } from '../../type/constructors';

function mapFunc(func: PlainFunctionValue, list: Observable<Value>) {
  return makeLazyArrayValue(list.switchMap(value => func(of(value))));
}

export const map: LibraryEntry = {
  type: makeFunctionType([
    makeFunctionType(['T'], 'R'),
    makeArrayType('T'),
  ], makeArrayType('T')),
  impl: evalArgs(mapFunc),
};
