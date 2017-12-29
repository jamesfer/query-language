import { makeFunctionType } from '../type';
import {
  makeLazyFunctionValue,
  PlainFunctionValue,
} from '../value';
import { Library, LibraryEntry } from './library';
import { evalArgs } from './library-utils';

const compose: LibraryEntry = {
  type: makeFunctionType([
    makeFunctionType(['T2'], 'R'),
    makeFunctionType(['T1'], 'T2'),
  ], makeFunctionType(['T1'],'R')),
  impl: evalArgs((second: PlainFunctionValue, first: PlainFunctionValue) => {
    return makeLazyFunctionValue(a => second(first(a)));
  }),
};

export const otherOperators: Library = {
  '&': compose,
};
