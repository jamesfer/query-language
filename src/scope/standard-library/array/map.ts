import { of } from 'rxjs/observable/of';
import {
  makeArrayType,
  makeFunctionType,
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
  let mapped = list.value.map(el => of(el)).switchMap(value => func.value(value));
  return makeLazyArrayValue(mapped);
}

export const map: LibraryEntry = {
  type: makeFunctionType([
    makeFunctionType(['T'], 'R'),
    makeArrayType('T'),
  ], makeArrayType('T')),
  impl: evaluateArguments(mapFunc),
};
