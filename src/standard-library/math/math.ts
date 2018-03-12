import { mergeLibraries } from '../library';
import { operators } from './operators';
import { trigonometry } from './trigonometry';
import { comparators } from './comparators';

export const math = mergeLibraries(
  operators,
  trigonometry,
  comparators,
);
