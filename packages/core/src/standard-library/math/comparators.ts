import { makeImplementation, makeInterface } from '../../interface';
import { InterfaceType } from '../../interface';
import { convertNativeToExpression, Library, NativeFunction } from '../../library';
import {
  booleanType,
  floatType,
  makeFunctionType,
  makeTypeVariable,
} from '../../type/constructors';
import { bindBooleanFunction } from '../library-utils';
import { Implementation } from '../../scope';
import { integerType } from '../../qlang';

const equatableType = makeTypeVariable('E');
const Equatable: InterfaceType = makeInterface({
  parameters: [equatableType],
  methods: {
    '=': makeFunctionType(
      [{ interfaceName: 'Equatable', args: [equatableType] }],
      [equatableType, equatableType],
      booleanType,
    ),
  },
});

// const equalsFunction = makeFunctionValue(bindBooleanFunction((a, b) => a === b));
// const equateable: InterfaceType = makeImplementation({
//   methods: {
//     '=': {
//       kind: 'Method',
//       resultType: makeFunctionType(['self', 'self'], booleanType),
//       messages: [],
//       tokens: [],
//       implementations: {
//         float: {
//           instance: floatType,
//           value: equalsFunction,
//           argumentNames: [],
//         },
//         string: {
//           instance: stringType,
//           value: equalsFunction,
//           argumentNames: [],
//         },
//       },
//     },
//   },
// });
//
// const lessThanFunction = makeFunctionValue(bindBooleanFunction((a, b) => a < b));
// const orderable: InterfaceType = makeImplementation({
//   parents: [equateable],
//   methods: {
//     '<': {
//       kind: 'Method',
//       resultType: makeFunctionType(['self', 'self'], booleanType),
//       messages: [],
//       tokens: [],
//       implementations: {
//         float: {
//           instance: floatType,
//           value: lessThanFunction,
//           argumentNames: [],
//         },
//         string: {
//           instance: stringType,
//           value: lessThanFunction,
//           argumentNames: [],
//         },
//       },
//     },
//   },
// });



const greaterThan: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], booleanType),
  implementation: bindBooleanFunction((a, b) => a > b),
};

const greaterEqual: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], booleanType),
  implementation: bindBooleanFunction((a, b) => a >= b),
};

// const lessThan: LibraryFunction = {
//   type: makeFunctionType([ floatType, floatType ], booleanType),
//   impl: bindBooleanFunction((a, b) => a < b),
// };

const lessEqual: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], booleanType),
  implementation: bindBooleanFunction((a, b) => a <= b),
};

const equal: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], booleanType),
  implementation: bindBooleanFunction((a, b) => a === b),
};

const notEqual: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], booleanType),
  implementation: bindBooleanFunction((a, b) => {
    return a !== b;
  }),
};

const equatableFloatInstance: Implementation = makeImplementation({
  parameters: [floatType],
  methods: {
    '=': convertNativeToExpression(equal),
  },
});

const equatableIntegerInstance: Implementation = makeImplementation({
  parameters: [integerType],
  methods: {
    '=': convertNativeToExpression({
      type: makeFunctionType([], [integerType, integerType], booleanType),
      implementation: equal.implementation,
    }),
  },
});


export const comparators: Library = {
  nativeFunctions: {
    // '=': equal,
    '!=': notEqual,
    '>': greaterThan,
    '>=': greaterEqual,
    // '<': lessThan,
    '<=': lessEqual,
  },
  interfaces: {
    Equatable,
    // Orderable: orderable,
  },
  implementations: {
    'Equatable': [
      equatableFloatInstance,
      equatableIntegerInstance,
    ],
  },
};
