import { sum } from './sum';
import { map } from './map';
import { head } from './head';
import { take } from './take';
import { inArray } from './in';
import { range } from './range';

export const array = {
  sum,
  map,
  head,
  take,
  'in': inArray,
  '..': range,
};
