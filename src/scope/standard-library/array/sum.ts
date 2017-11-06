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

function sumFunc(list: LazyValue<ArrayValue>): LazyValue<FloatValue> {
  return list.switchMap(list => {
    return list.value.reduce((sum, { value }) => sum + (value as number), 0)
      .map(value => makeFloatValue(value));
  })
}

export const sum: LibraryEntry = {
  type: makeFunctionType([makeArrayType(FloatType)], FloatType),
  impl: sumFunc,
};
