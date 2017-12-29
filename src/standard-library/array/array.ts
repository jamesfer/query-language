import { sum } from './sum';
import { map } from './map';
import { head } from './head';
import { take } from './take';
import { _in } from './in';
import { range } from './range';

export const array = {
  sum,
  map,
  head,
  take,
  'in': _in,
  '..': range,
};
