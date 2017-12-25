import { makeFunctionType } from '../../type.model';
import { FunctionValue, makeLazyFunctionValue } from '../../value.model';
import { Library, LibraryEntry } from '../library';
import { evalArgs } from '../library-utils';

const compose: LibraryEntry = {
  type: makeFunctionType([
    makeFunctionType(['T2'], 'R'),
    makeFunctionType(['T1'], 'T2'),
  ], makeFunctionType(['T1'],'R')),
  impl: evalArgs((second: FunctionValue, first: FunctionValue) => {
    return makeLazyFunctionValue(a => second.value(first.value(a)));
  }),
};

export const otherOperators: Library = {
  '&': compose,
};
