import { floatType, makeFunctionType } from '../../type/constructors';
import { Library, LibraryFunction, NativeFunction } from '../../library';
import { bindFloatFunction } from '../library-utils';

const add: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], floatType),
  implementation: bindFloatFunction((a, b) => a + b),
};

const subtract: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], floatType),
  implementation: bindFloatFunction((a, b) => a - b),
};

const multiply: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], floatType),
  implementation: bindFloatFunction((a, b) => a * b),
};

const divide: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], floatType),
  implementation: bindFloatFunction((a, b) => a / b),
};

const modulo: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], floatType),
  implementation: bindFloatFunction((a, b) => a % b),
};

const power: NativeFunction = {
  type: makeFunctionType([], [floatType, floatType], floatType),
  implementation: bindFloatFunction((a, b) => a ** b),
};


export const operators: Library = {
  nativeFunctions: {
    '+': add,
    '*': multiply,
    '/': divide,
    '-': subtract,
    '%': modulo,
    '**': power,
  },
};

