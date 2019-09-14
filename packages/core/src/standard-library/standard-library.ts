import { Library, mergeLibraries } from '../library';
import branching from './branching/branching';
import { math } from './math/math';
import { otherOperators } from './other-operators';
import { array } from './array/array';

// Explicit type annotation is required here for generating .d.ts files
const standardLibrary: Library = mergeLibraries(
  math,
  otherOperators,
  // array,
  // branching,
);

export default standardLibrary;
