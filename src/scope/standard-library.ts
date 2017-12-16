import { Library } from './library';
import { buildRange } from './standard-library/array/build-range';
import { head } from './standard-library/array/head';
import { inArray } from './standard-library/array/in';
import { map } from './standard-library/array/map';
import { sum } from './standard-library/array/sum';
import { ifBranch } from './standard-library/branching/if';
import { math } from './standard-library/math/math';
import { otherOperators } from './standard-library/other-operators';
import { comparators } from './standard-library/comparators';
import { take } from './standard-library/array/take';

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
