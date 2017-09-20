import { evaluateArguments } from '../prepare-function';
import {
  BooleanType, FloatType, makeArrayType,
  makeFunctionType,
} from '../../type.model';
import {
  ArrayValue, BooleanFalseValue, BooleanTrueValue, BooleanValue,
  Value,
} from '../../value.model';
import { LibraryEntry } from '../library';

function inFunc(a: Value, b: ArrayValue): BooleanValue {
  let aValue = a.value;
  let iterator = b.value;
  let { value: element, done } = iterator.next();

  while (!done) {
    if (element.value === aValue) {
      return BooleanTrueValue;
    }
    ({ value: element, done } = iterator.next());
  }
  return BooleanFalseValue;
}

export const inArray: LibraryEntry = {
  // TODO fix type
  type: makeFunctionType([ FloatType, makeArrayType(FloatType) ], BooleanType),
  impl: evaluateArguments(inFunc),
};
