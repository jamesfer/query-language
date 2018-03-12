import { makeFunctionType } from '../type/constructors';
import {
  makeLazyFunctionValue,
  PlainFunctionValue,
} from '../value';
import { Library, LibraryFunction } from './library';
import { evalArgs } from './library-utils';

const compose: LibraryFunction = {
  type: makeFunctionType([
    makeFunctionType(['T2'], 'R'),
    makeFunctionType(['T1'], 'T2'),
  ], makeFunctionType(['T1'],'R')),
  impl: evalArgs((second: PlainFunctionValue, first: PlainFunctionValue) => {
    return makeLazyFunctionValue(a => second(first(a)));
  }),
};

export const otherOperators: Library = {
  functions: {
    '&': compose,
  },
};
