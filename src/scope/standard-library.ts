import { sum } from './standard-library/array/sum';
import { inArray } from './standard-library/array/in';
import { buildRange } from './standard-library/array/buildRange';
import { head } from './standard-library/array/head';
import { Library } from './library';
import { math } from './standard-library/math/math';
import { map } from './standard-library/array/map';
import { ifBranch } from './standard-library/branching/if';

export const standardLibrary: Library = {
  ...math,

  'in': inArray,
  '..': buildRange,
  'if': ifBranch,

  sum,
  map,
  head,
};
