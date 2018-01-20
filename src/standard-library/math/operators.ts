import { FloatType, makeFunctionType } from '../../type/type';
import { Library, LibraryEntry } from '../library';
import { bindFloatFunction } from '../library-utils';



const add: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], FloatType),
  impl: bindFloatFunction((a, b) => a + b),
};

const subtract: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], FloatType),
  impl: bindFloatFunction((a, b) => a - b),
};

const multiply: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], FloatType),
  impl: bindFloatFunction((a, b) => a * b),
};

const divide: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], FloatType),
  impl: bindFloatFunction((a, b) => a / b),
};

const modulo: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], FloatType),
  impl: bindFloatFunction((a, b) => a % b),
};

const power: LibraryEntry = {
  type: makeFunctionType([ FloatType, FloatType ], FloatType),
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

