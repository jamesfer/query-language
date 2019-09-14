import { Library, mergeLibraries } from '../../library';
import { operators } from './operators';
import { trigonometry } from './trigonometry';
import { comparators } from './comparators';

// Explicit type annotation is required here for generating .d.ts files
export const math: Library = mergeLibraries(
  // operators,
  trigonometry,
  // comparators,
);
