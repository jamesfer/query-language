import { of } from 'rxjs/observable/of';
import {
  makeArrayType,
  makeFunctionType,
  makeGenericType,
} from '../../../type.model';
import {
  ArrayValue,
  FunctionValue,
  LazyValue,
  makeLazyArrayValue,
} from '../../../value.model';
import { LibraryEntry } from '../../library';
import { evaluateArguments } from '../../library-utils';

function mapFunc(func: FunctionValue, list: ArrayValue): LazyValue<ArrayValue> {
  let mapped = list.value.map(of).map(value => func.value(value)).switch();
  return makeLazyArrayValue(mapped);
}

export const map: LibraryEntry = {
  type: makeFunctionType([
    makeFunctionType([makeGenericType('T')], makeGenericType('R')),
    makeArrayType(makeGenericType('T')),
  ], makeArrayType(makeGenericType('T'))),
  impl: evaluateArguments(mapFunc),
};
