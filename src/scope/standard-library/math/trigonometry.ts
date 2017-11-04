import { FloatType, makeFunctionType } from '../../../type.model';
import { Library, LibraryEntry } from '../../library';
import { bindFloatFunction } from '../../library-utils';


const tan: LibraryEntry = {
  type: makeFunctionType([FloatType], FloatType),
  impl: bindFloatFunction(Math.tan),
};

const sin: LibraryEntry = {
  type: makeFunctionType([FloatType], FloatType),
  impl: bindFloatFunction(Math.sin),
};

const cos: LibraryEntry = {
  type: makeFunctionType([FloatType], FloatType),
  impl: bindFloatFunction(Math.cos),
};

const atan: LibraryEntry = {
  type: makeFunctionType([FloatType], FloatType),
  impl: bindFloatFunction(Math.atan),
};

const asin: LibraryEntry = {
  type: makeFunctionType([FloatType], FloatType),
  impl: bindFloatFunction(Math.asin),
};

const acos: LibraryEntry = {
  type: makeFunctionType([FloatType], FloatType),
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
