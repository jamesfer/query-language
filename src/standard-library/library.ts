import { mapValues } from 'lodash';
import { Type } from '../type/type';
import { makeLazyFunctionValue, PlainFunctionValue, } from '../value';
import { Scope } from '../scope';

export interface LibraryEntry {
  type: Type,
  impl: PlainFunctionValue,
}

export interface Library {
  [name: string]: LibraryEntry,
}

export function convertToScope(library: Library): Scope {
  return mapValues(library, entry => ({
    type: entry.type,
    value: makeLazyFunctionValue(entry.impl),
  }));
}
