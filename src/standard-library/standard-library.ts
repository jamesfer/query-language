import { Library } from './library';
import { buildRange } from './array/build-range';
import { head } from './array/head';
import { inArray } from './array/in';
import { map } from './array/map';
import { sum } from './array/sum';
import { ifBranch } from './branching/if';
import { math } from './math/math';
import { otherOperators } from './other-operators';
import { comparators } from './comparators';
import { take } from './array/take';

export const standardLibrary: Library = {
  ...math,
  ...otherOperators,
  ...comparators,

  'in': inArray,
  '..': buildRange,
  'if': ifBranch,

  sum,
  map,
  head,
  take,
};
