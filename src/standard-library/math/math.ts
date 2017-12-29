import { Library } from '../library';
import { operators } from './operators';
import { trigonometry } from './trigonometry';

export const math: Library = {
  ...operators,
  ...trigonometry,
};
