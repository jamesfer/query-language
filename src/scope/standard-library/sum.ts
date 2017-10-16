import { exhaustIterator } from '../../utils';
import { sum as lodashSum, map } from 'lodash';
import { FloatType, makeArrayType, makeFunctionType } from '../../type.model';
import {
  ArrayValue, FloatValue, LazyValue,
  makeFloatValue, PromiseValue,
} from '../../value.model';
import { LibraryEntry } from '../library';

function sumFunc(list: LazyValue<ArrayValue>): PromiseValue<FloatValue> {
  return list().then(list => {
    let values = exhaustIterator(list.value);
    return Promise.all(values).then(values => {
      return makeFloatValue(lodashSum(map(values, 'value')));
    });
  });
}

export const sum: LibraryEntry = {
  type: makeFunctionType([makeArrayType(FloatType)], FloatType),
  impl: sumFunc,
};
