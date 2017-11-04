import { Library, LibraryEntry } from '../library';
import { makeFunctionType, makeGenericType } from '../../type.model';
import { FunctionValue, makeLazyFunctionValue } from '../../value.model';
import { evaluateArguments } from '../library-utils';

const compose: LibraryEntry = {
  type: makeFunctionType([
    makeFunctionType([makeGenericType('T2')], makeGenericType('R')),
    makeFunctionType([makeGenericType('T1')], makeGenericType('T2')),
  ], makeFunctionType([makeGenericType('T1')], makeGenericType('R'))),
  impl: evaluateArguments((second: FunctionValue, first: FunctionValue) => {
    return makeLazyFunctionValue(a => second.value(first.value(a)));
  }),
};

export const otherOperators: Library = {
  '&': compose,
};
