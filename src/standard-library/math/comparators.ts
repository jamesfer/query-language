import { Library, LibraryEntry } from '../library';
import { makeFunctionType } from '../../type/constructors';
import { bindBooleanFunction } from '../library-utils';
import { booleanType, floatType } from '../../type/constructors';

const greaterThan: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a > b),
};

const greaterEqual: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a >= b),
};

const lessThan: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a < b),
};

const lessEqual: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a <= b),
};

const equal: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a === b),
};

const notEqual: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => {
    return a !== b;
  }),
};


export const comparators: Library = {
  '=': equal,
  '!=': notEqual,
  '>': greaterThan,
  '>=': greaterEqual,
  '<': lessThan,
  '<=': lessEqual,
};
