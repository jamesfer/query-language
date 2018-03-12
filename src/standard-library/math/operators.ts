import { makeFunctionType } from '../../type/constructors';
import { Library, LibraryFunction } from '../library';
import { bindFloatFunction } from '../library-utils';
import { floatType } from '../../type/constructors';



const add: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a + b),
};

const subtract: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a - b),
};

const multiply: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a * b),
};

const divide: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a / b),
};

const modulo: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a % b),
};

const power: LibraryFunction = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a ** b),
};


export const operators: Library = {
  functions: {
    '+': add,
    '*': multiply,
    '/': divide,
    '-': subtract,
    '%': modulo,
    '**': power,
  },
};

