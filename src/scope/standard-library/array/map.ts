import {
  ArrayValue, FunctionValue, makeArrayValue,
  PromiseValue,
} from '../../../value.model';
import { LibraryEntry } from '../../library';
import {
  makeArrayType, makeFunctionType,
  makeGenericType,
} from '../../../type.model';
import { evaluateArguments } from '../../library-utils';

function mapFunc(func: FunctionValue, list: ArrayValue): PromiseValue<ArrayValue> {
  const iterate = function*() {
    let result = list.value.next();
    while (!result.done) {
      yield func.value(() => result.value);
      result = list.value.next();
    }
  };
  return Promise.resolve(makeArrayValue(iterate()));
}

export const map: LibraryEntry = {
  type: makeFunctionType([
    makeFunctionType([makeGenericType('T')], makeGenericType('R')),
    makeArrayType(makeGenericType('T')),
  ], makeArrayType(makeGenericType('T'))),
  impl: evaluateArguments(mapFunc),
};
