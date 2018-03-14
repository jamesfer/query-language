import { InterfaceType } from '../../type/type';
import { Library, LibraryFunction } from '../library';
import {
  makeFunctionType, stringType,
} from '../../type/constructors';
import { bindBooleanFunction } from '../library-utils';
import { booleanType, floatType, makeInterfaceType } from '../../type/constructors';

// const equalsFunction = bindBooleanFunction((a, b) => a === b);
// const Equateable: InterfaceType = makeInterfaceType(null, {
//   '=': {
//     signature: makeFunctionType([ 'self', 'self' ], booleanType),
//     implementations: {
//       'float': {
//         type: floatType,
//         func: equalsFunction,
//       },
//       'string': {
//         type: stringType,
//         func: equalsFunction,
//       },
//       'boolean': {
//         type: booleanType,
//         func: equalsFunction,
//       },
//     },
//   },
// });

// const lessThanFunction = bindBooleanFunction((a, b) => a < b);
// const Compareable: InterfaceType = makeInterfaceType(null, {
//   '<': {
//     signature: makeFunctionType([ 'self', 'self' ], booleanType),
//     implementations: {
//       'float': {
//         type: floatType,
//         func: lessThanFunction,
//       },
//       'string': {
//         type: stringType,
//         func: lessThanFunction,
//       },
//     },
//   },
// });



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
  types: {
    // Equateable,
    // Compareable,
  }
};
