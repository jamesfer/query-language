import { Library, mergeLibraries } from '../library';
import { ifFunc } from './branching/if';
import { math } from './math/math';
import { otherOperators } from './other-operators';
import { array } from './array/array';

// Explicit type annotation is required here for generating .d.ts files
export const standardLibrary: Library = mergeLibraries(
  math,
  otherOperators,
  array,
  // {
  //   functions: { if: ifFunc },
  // },
);
