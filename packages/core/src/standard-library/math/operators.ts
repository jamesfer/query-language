import { ExpressionKind } from '../../compiler/expression';
import { type } from '../../compiler/type/type';
import { LazyValue, Record, String } from '../../compiler/value';
import {
  anything,
  floatType,
  functionType,
  integerType,
  lazyValue,
  stringType,
  unboundVariable,
  userDefinedLiteral,
} from '../../compiler/value-constructors';
import { Library, LibraryImplementation, LibraryLambda, NativeLibraryLambda } from '../../library';
import { bindFloatFunction, bindIntegerFunction } from '../library-utils';

const floatFunctionType = type(functionType(
  lazyValue(floatType),
  lazyValue(floatType),
  lazyValue(floatType),
));

const integerFunctionType = type(functionType(
  lazyValue(integerType),
  lazyValue(integerType),
  lazyValue(integerType),
));

const addFloat: NativeLibraryLambda = {
  type: floatFunctionType,
  body: bindFloatFunction((a, b) => a + b),
  parameterCount: 2,
};

const subtractFloat: NativeLibraryLambda = {
  type: floatFunctionType,
  body: bindFloatFunction((a, b) => a - b),
  parameterCount: 2,
};

const multiplyFloat: NativeLibraryLambda = {
  type: floatFunctionType,
  body: bindFloatFunction((a, b) => a * b),
  parameterCount: 2,
};

const divideFloat: NativeLibraryLambda = {
  type: floatFunctionType,
  body: bindFloatFunction((a, b) => a / b),
  parameterCount: 2,
};

const addInteger: NativeLibraryLambda = {
  type: integerFunctionType,
  body: bindIntegerFunction((a, b) => a + b),
  parameterCount: 2,
};

const subtractInteger: NativeLibraryLambda = {
  type: integerFunctionType,
  body: bindIntegerFunction((a, b) => a - b),
  parameterCount: 2,
};

const multiplyInteger: NativeLibraryLambda = {
  type: integerFunctionType,
  body: bindIntegerFunction((a, b) => a * b),
  parameterCount: 2,
};

const divideInteger: NativeLibraryLambda = {
  type: integerFunctionType,
  body: bindIntegerFunction((a, b) => a / b),
  parameterCount: 2,
};

// const moduloFloat: NativeLibraryLambda = {
//   type: makeFunctionType([], [floatType, floatType], floatType),
//   body: bindFloatFunction((a, b) => a % b),
// };
//
// const powerFloat: NativeLibraryLambda = {
//   type: makeFunctionType([], [floatType, floatType], floatType),
//   body: bindFloatFunction((a, b) => a ** b),
// };


const propertyAccess: NativeLibraryLambda = {
  type: type(functionType(lazyValue(anything), lazyValue(stringType), lazyValue(anything))),
  parameterCount: 2,
  body: (record: LazyValue<Record>, key: LazyValue<String>) => async () => (
    (await record()).values[(await key()).value]()
  ),
};

const add: LibraryLambda = {
  type: type(
    functionType(lazyValue(unboundVariable('a')), lazyValue(unboundVariable('a')), lazyValue(unboundVariable('a'))),
    [{
      kind: 'TypeConstraint',
      child: lazyValue(unboundVariable('a')),
      parent: lazyValue(userDefinedLiteral('Numeric')),
    }],
  ),
  parameterNames: ['interface', 'a', 'b'],
  body: {
    kind: ExpressionKind.Application,
    implicitParameters: [],
    tokens: [],
    resultType: type(lazyValue(unboundVariable('a'))),
    callee: {
      kind: ExpressionKind.Application,
      implicitParameters: [],
      tokens: [],
      resultType: type(functionType(lazyValue(unboundVariable('a')), lazyValue(unboundVariable('a')), lazyValue(unboundVariable('a')))),
      callee: {
        kind: ExpressionKind.Identifier,
        implicitParameters: [],
        tokens: [],
        resultType: type(functionType(lazyValue(anything), lazyValue(stringType), lazyValue(anything))),
        name: '.',
      },
      parameters: [
        {
          kind: ExpressionKind.Identifier,
          implicitParameters: [],
          tokens: [],
          resultType: type(lazyValue(anything)),
          name: 'interface',
        },
        {
          kind: ExpressionKind.String,
          implicitParameters: [],
          tokens: [],
          resultType: type(lazyValue(stringType)),
          value: '+',
        },
      ],
    },
    parameters: [
      {
        kind: ExpressionKind.Identifier,
        implicitParameters: [],
        tokens: [],
        resultType: type(lazyValue(unboundVariable('a'))),
        name: 'a',
      },
      {
        kind: ExpressionKind.Identifier,
        implicitParameters: [],
        tokens: [],
        resultType: type(lazyValue(unboundVariable('a'))),
        name: 'b',
      },
    ],
  },
};


const floatNumberImplementation: LibraryImplementation = {
  child: lazyValue(floatType),
  parent: lazyValue(userDefinedLiteral('Numeric')),
  constraints: [],
  values: {
    '+': {
      kind: ExpressionKind.Lambda,
      implicitParameters: [],
      tokens: [],
      parameterNames: ['a', 'b'],
      resultType: floatFunctionType,
      body: {
        kind: ExpressionKind.Application,
        implicitParameters: [],
        tokens: [],
        resultType: type(lazyValue(floatType)),
        callee: {
          kind: ExpressionKind.Identifier,
          implicitParameters: [],
          tokens: [],
          resultType: floatFunctionType,
          name: 'addFloat',
        },
        parameters: [
          {
            kind: ExpressionKind.Identifier,
            implicitParameters: [],
            tokens: [],
            resultType: type(lazyValue(floatType)),
            name: 'a',
          },
          {
            kind: ExpressionKind.Identifier,
            implicitParameters: [],
            tokens: [],
            resultType: type(lazyValue(floatType)),
            name: 'b',
          },
        ],
      },
    },
  },
};

const integerNumberImplementation: LibraryImplementation = {
  child: lazyValue(integerType),
  parent: lazyValue(userDefinedLiteral('Numeric')),
  constraints: [],
  values: {
    '+': {
      kind: ExpressionKind.Lambda,
      implicitParameters: [],
      tokens: [],
      parameterNames: ['a', 'b'],
      resultType: integerFunctionType,
      body: {
        kind: ExpressionKind.Application,
        implicitParameters: [],
        tokens: [],
        resultType: type(lazyValue(integerType)),
        callee: {
          kind: ExpressionKind.Identifier,
          implicitParameters: [],
          tokens: [],
          resultType: integerFunctionType,
          name: 'addInteger',
        },
        parameters: [
          {
            kind: ExpressionKind.Identifier,
            implicitParameters: [],
            tokens: [],
            resultType: type(lazyValue(integerType)),
            name: 'a',
          },
          {
            kind: ExpressionKind.Identifier,
            implicitParameters: [],
            tokens: [],
            resultType: type(lazyValue(integerType)),
            name: 'b',
          },
        ],
      },
    },
  },
};

export const operators: Library = {
  lambdas: {
    '+': add,
  },
  nativeLambdas: {
    addFloat,
    addInteger,
    multiplyFloat,
    multiplyInteger,
    divideFloat,
    divideInteger,
    subtractFloat,
    subtractInteger,
    // '%': modulo,
    // '**': power,
    '.': propertyAccess,
  },
  implementations: {
    floatNumberImplementation,
    integerNumberImplementation,
  },
};

