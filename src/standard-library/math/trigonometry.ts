import { makeFunctionType } from '../../type/constructors';
import { Library, LibraryEntry } from '../library';
import { bindFloatFunction } from '../library-utils';
import { floatType } from '../../type/constructors';


const tan: LibraryEntry = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.tan),
};

const sin: LibraryEntry = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.sin),
};

const cos: LibraryEntry = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.cos),
};

const atan: LibraryEntry = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.atan),
};

const asin: LibraryEntry = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.asin),
};

const acos: LibraryEntry = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.acos),
};


export const trigonometry: Library = {
  tan,
  sin,
  cos,
  atan,
  asin,
  acos,
};
