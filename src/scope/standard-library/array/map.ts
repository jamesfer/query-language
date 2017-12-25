import { of } from 'rxjs/observable/of';
import {
  makeArrayType,
  makeFunctionType,
} from '../../../type.model';
import {
  makeLazyArrayValue, PlainFunctionValue, Value,
} from '../../../value.model';
import { LibraryEntry } from '../../library';
import { evalArgs } from '../../library-utils';
import { Observable } from 'rxjs/Observable';

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
