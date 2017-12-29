import { Library, LibraryEntry } from './library';
import { BooleanType, FloatType, makeFunctionType } from '../type.model';
import { bindBooleanFunction } from './library-utils';

const greaterThan: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], BooleanType),
  impl: bindBooleanFunction((a, b) => a > b),
};

const greaterEqual: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], BooleanType),
  impl: bindBooleanFunction((a, b) => a >= b),
};

const lessThan: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], BooleanType),
  impl: bindBooleanFunction((a, b) => a < b),
};

const lessEqual: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], BooleanType),
  impl: bindBooleanFunction((a, b) => a <= b),
};

const equal: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], BooleanType),
  impl: bindBooleanFunction((a, b) => a === b),
};

const notEqual: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], BooleanType),
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
