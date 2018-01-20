import { makeFunctionType } from '../../type/constructors';
import { Library, LibraryEntry } from '../library';
import { bindFloatFunction } from '../library-utils';
import { floatType } from '../../type/constructors';



const add: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a + b),
};

const subtract: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a - b),
};

const multiply: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a * b),
};

const divide: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a / b),
};

const modulo: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a % b),
};

const power: LibraryEntry = {
  type: makeFunctionType([ floatType, floatType ], floatType),
  impl: bindFloatFunction((a, b) => a ** b),
};


export const operators: Library = {
  '+': add,
  '*': multiply,
  '/': divide,
  '-': subtract,
  '%': modulo,
  '**': power,
};

