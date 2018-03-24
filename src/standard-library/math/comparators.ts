import { InterfaceType } from '../../type/type';
import { Library, LibraryFunction } from '../library';
import {
  makeFunctionType, stringType,
} from '../../type/constructors';
import { bindBooleanFunction } from '../library-utils';
import { booleanType, floatType, makeInterfaceType } from '../../type/constructors';
import { makeFunctionValue } from '../../value';

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

const equalsFunction = makeFunctionValue(bindBooleanFunction((a, b) => a === b));
const Equateable: InterfaceType = makeInterfaceType({
  methods: {
    '=': {
      kind: 'Method',
      resultType: makeFunctionType([ 'self', 'self' ], booleanType),
      messages: [],
      tokens: [],
      implementations: {
        'float': {
          instance: floatType,
          value: equalsFunction,
          argumentNames: [],
        },
        'string': {
          instance: stringType,
          value: equalsFunction,
          argumentNames: [],
        },
      },
    },
  }
});

const lessThanFunction = makeFunctionValue(bindBooleanFunction((a, b) => a < b));
const Orderable: InterfaceType = makeInterfaceType({
  parents: [ Equateable ],
  methods: {
    '<': {
      kind: 'Method',
      resultType: makeFunctionType([ 'self', 'self' ], booleanType),
      messages: [],
      tokens: [],
      implementations: {
        'float': {
          instance: floatType,
          value: lessThanFunction,
          argumentNames: [],
        },
        'string': {
          instance: stringType,
          value: lessThanFunction,
          argumentNames: [],
        },
      },
    },
  },
});



const greaterThan: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a > b),
};

const greaterEqual: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], booleanType),
  impl: bindBooleanFunction((a, b) => a >= b),
};

// const lessThan: LibraryFunction = {
//   type: makeFunctionType([ floatType, floatType ], booleanType),
//   impl: bindBooleanFunction((a, b) => a < b),
// };

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
    // '=': equal,
    '!=': notEqual,
    '>': greaterThan,
    '>=': greaterEqual,
    // '<': lessThan,
    '<=': lessEqual,
  },
  types: {
    Equateable,
    Orderable,
  }
};
