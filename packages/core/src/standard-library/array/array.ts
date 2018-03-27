import { sum } from './sum';
import { map } from './map';
import { head } from './head';
import { take } from './take';
import { inFunc } from './in';
import { range } from './range';
import { Library } from 'standard-library/library';

export const array: Library = {
  functions: {
    sum,
    map,
    head,
    take,
    in: inFunc,
    '..': range,
  },
};
