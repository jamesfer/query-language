import { of } from 'rxjs/observable/of';
import { makeArrayType, makeFunctionType } from '../../type/constructors';
import { makeLazyArrayValue, PlainFunctionValue, Value } from '../../value';
import { NativeFunction } from '../../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';

function mapFunc(func: PlainFunctionValue, list: Observable<Value>) {
  // TODO work out how to pass interfaces to lower functions
  return makeLazyArrayValue(list.switchMap(value => func()(of(value))));
}

export const map: NativeFunction = {
  type: makeFunctionType(
    [],
    [
      makeFunctionType([], ['T'], 'R'),
      makeArrayType('T'),
    ],
    makeArrayType('T'),
  ),
  implementation: evalArgs(mapFunc),
};
