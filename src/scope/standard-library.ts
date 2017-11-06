import { Library } from './library';
import { buildRange } from './standard-library/array/buildRange';
import { head } from './standard-library/array/head';
import { inArray } from './standard-library/array/in';
import { map } from './standard-library/array/map';
import { sum } from './standard-library/array/sum';
import { ifBranch } from './standard-library/branching/if';
import { math } from './standard-library/math/math';
import { otherOperators } from './standard-library/other-operators';

export const standardLibrary: Library = {
  ...math,
  ...otherOperators,

  'in': inArray,
  '..': buildRange,
  'if': ifBranch,

  sum,
  map,
  head,
};
