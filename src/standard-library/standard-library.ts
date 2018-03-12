import { mergeLibraries } from './library';
import { _if } from './branching/if';
import { math } from './math/math';
import { otherOperators } from './other-operators';
import { array } from './array/array';

export const standardLibrary = mergeLibraries(
  math,
  otherOperators,
  array,
  {
    functions: { 'if': _if },
  },
);
