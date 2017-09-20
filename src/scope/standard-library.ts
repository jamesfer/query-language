import { sum } from './standard-library/sum';
import { inArray } from './standard-library/in';
import { buildRange } from './standard-library/buildRange';
import { head } from './standard-library/head';
import { Library } from './library';
import { math } from './standard-library/math/math';

export const standardLibrary: Library = {
  ...math,

  'in': inArray,
  '..': buildRange,

  sum,
  head,
};
