import { makeFunctionType } from '../../type/constructors';
import { Library, LibraryFunction } from '../library';
import { bindFloatFunction } from '../library-utils';
import { floatType } from '../../type/constructors';


const tan: LibraryFunction = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.tan),
};

const sin: LibraryFunction = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.sin),
};

const cos: LibraryFunction = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.cos),
};

const atan: LibraryFunction = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.atan),
};

const asin: LibraryFunction = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.asin),
};

const acos: LibraryFunction = {
  type: makeFunctionType([floatType], floatType),
  impl: bindFloatFunction(Math.acos),
};


export const trigonometry: Library = {
  functions: {
    tan,
    sin,
    cos,
    atan,
    asin,
    acos,
  },
};
