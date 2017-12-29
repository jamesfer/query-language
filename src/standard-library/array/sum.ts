import 'rxjs/add/operator/reduce';
import {
  FloatType,
  makeArrayType,
  makeFunctionType,
} from '../../type.model';
import {
  FloatValue,
  LazyValue,
  makeFloatValue, Value,
} from '../../value.model';
import { LibraryEntry } from '../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';

function sumFunc(list: Observable<Value>): LazyValue<FloatValue> {
  return list.reduce((sum, { value }) => sum + (value as number), 0)
    .map(makeFloatValue);
}

export const sum: LibraryEntry = {
  type: makeFunctionType([makeArrayType(FloatType)], FloatType),
  impl: evalArgs(sumFunc),
};
