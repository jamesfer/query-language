import 'rxjs/add/operator/reduce';
import {
  FloatType,
  makeArrayType,
  makeFunctionType,
} from '../../../type.model';
import {
  ArrayValue,
  FloatValue,
  LazyValue,
  makeFloatValue,
} from '../../../value.model';
import { LibraryEntry } from '../../library';
import { evalArgs } from '../../library-utils';

function sumFunc(list: ArrayValue): LazyValue<FloatValue> {
  return list.value.reduce((sum, { value }) => sum + (value as number), 0)
    .map(makeFloatValue);
}

export const sum: LibraryEntry = {
  type: makeFunctionType([makeArrayType(FloatType)], FloatType),
  impl: evalArgs(sumFunc),
};
