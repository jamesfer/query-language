import 'rxjs/add/operator/reduce';
import {
  makeArrayType,
  } from '../../type/constructors';
import {
  FloatValue,
  LazyValue,
  makeFloatValue, Value,
} from '../../value';
import { LibraryEntry } from '../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';
import { floatType, makeFunctionType } from '../../type/constructors';

function sumFunc(list: Observable<Value>): LazyValue<FloatValue> {
  return list.reduce((sum, { value }) => sum + (value as number), 0)
    .map(makeFloatValue);
}

export const sum: LibraryEntry = {
  type: makeFunctionType([makeArrayType(floatType)], floatType),
  impl: evalArgs(sumFunc),
};
