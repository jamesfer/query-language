import { Library, LibraryFunction } from '../library';
import { makeFunctionType } from '../../type/constructors';
import { bindBooleanFunction } from '../library-utils';
import { booleanType, floatType } from '../../type/constructors';

const greaterThan: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a > b),
};

const greaterEqual: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a >= b),
};

const lessThan: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a < b),
};

const lessEqual: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a <= b),
};

const equal: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a === b),
};

const notEqual: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => {
    return a !== b;
  }),
};


export const comparators: Library = {
  functions: {
    '=': equal,
    '!=': notEqual,
    '>': greaterThan,
    '>=': greaterEqual,
    '<': lessThan,
    '<=': lessEqual,
  },
};
