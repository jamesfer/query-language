import { evaluateArguments } from '../prepare-function';
import { exhaustIterator } from '../../utils';
import { sum as _sum, map } from 'lodash';
import { FloatType, makeArrayType, makeFunctionType } from '../../type.model';
import { ArrayValue, FloatValue, makeFloatValue } from '../../value.model';
import { LibraryEntry } from '../library';

function sumFunc(list: ArrayValue): FloatValue {
  let values = exhaustIterator(list.value);
  return makeFloatValue(_sum(map(values, val => val.value)));
}

export const sum: LibraryEntry = {
  type: makeFunctionType([makeArrayType(FloatType)], FloatType),
  impl: evaluateArguments(sumFunc),
};
