import 'rxjs/add/operator/reduce';
import { floatType, makeArrayType, makeFunctionType } from '../../type/constructors';
import { FloatValue, LazyValue, makeFloatValue, Value } from '../../value';
import { LibraryFunction } from '../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';

function sumFunc(list: Observable<Value>): LazyValue<FloatValue> {
  return list.reduce((sum, { value }) => sum + (value as number), 0)
    .map(makeFloatValue);
}

export const sum: LibraryFunction = {
  type: makeFunctionType([makeArrayType(floatType)], floatType),
  impl: evalArgs(sumFunc),
};
