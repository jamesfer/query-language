import { Library } from './library';
import { _if } from './branching/if';
import { math } from './math/math';
import { otherOperators } from './other-operators';
import { array } from './array/array';

export const standardLibrary: Library = {
  ...math,
  ...otherOperators,
  ...array,

  'if': _if,
};
