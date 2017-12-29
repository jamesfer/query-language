import { Library } from '../library';
import { operators } from './operators';
import { trigonometry } from './trigonometry';
import { comparators } from './comparators';

export const math: Library = {
  ...operators,
  ...trigonometry,
  ...comparators,
};
