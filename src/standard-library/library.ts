import { mapValues, assign, map } from 'lodash';
import { Type } from '../type/type';
import { makeLazyFunctionValue, PlainFunctionValue, } from '../value';
import { Scope } from '../scope';

export interface LibraryFunction {
  type: Type,
  impl: PlainFunctionValue,
}

export interface Library {
  functions?: {
    [name: string]: LibraryFunction,
  },
  types?: {
    [name: string]: Type,
  },
}

export function mergeLibraries(...libraries: Library[]): Library {
  return {
    functions: assign({}, ...map(libraries, 'functions')),
    types: assign({}, ...map(libraries, 'types')),
  };
}

export function convertToScope(library: Library): Scope {
  return {
    types: library.types || {},
    variables: mapValues(library.functions, entry => ({
      type: entry.type,
      value: makeLazyFunctionValue(entry.impl),
    })),
  };
}
