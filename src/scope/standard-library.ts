import { sum } from './standard-library/array/sum';
import { inArray } from './standard-library/array/in';
import { buildRange } from './standard-library/array/buildRange';
import { head } from './standard-library/array/head';
import { Library } from './library';
import { math } from './standard-library/math/math';
import { map } from './standard-library/array/map';
import { ifBranch } from './standard-library/branching/if';
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
