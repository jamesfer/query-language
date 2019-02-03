import 'rxjs/add/operator/reduce';
import { floatType, makeArrayType, makeFunctionType } from '../../type/constructors';
import { FloatValue, LazyValue, makeFloatValue, Value } from '../../value';
import { NativeFunction } from '../../library';
import { evalArgs } from '../library-utils';
import { Observable } from 'rxjs/Observable';

function sumFunc(list: Observable<Value>): LazyValue<FloatValue> {
  return list.reduce((sum, { value }) => sum + (value as number), 0)
    .map(makeFloatValue);
}

export const sum: NativeFunction = {
  type: makeFunctionType([], [makeArrayType(floatType)], floatType),
  implementation: evalArgs(sumFunc),
};
