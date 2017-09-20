import { Library, LibraryEntry } from '../../library';
import { FloatType, makeFunctionType } from '../../../type.model';
import { bindFloatFunction } from 'scope/prepare-function';



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
  impl: bindFloatFunction((a, b) => a - b),
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

