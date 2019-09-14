import { type } from '../../compiler/type/type';
import { functionType, floatType, lazyValue } from '../../compiler/value-constructors';
import { Library, NativeLibraryLambda } from '../../library';
import { bindFloatFunction } from '../library-utils';

const floatToFloatType = type(functionType(lazyValue(floatType), lazyValue(floatType)));

const tan: NativeLibraryLambda = {
  type: type(functionType(lazyValue(floatType), lazyValue(floatType))),
  body: bindFloatFunction(Math.tan),
  parameterCount: 1,
};

const sin: NativeLibraryLambda = {
  type: floatToFloatType,
  body: bindFloatFunction(Math.sin),
  parameterCount: 1,
};

const cos: NativeLibraryLambda = {
  type: floatToFloatType,
  body: bindFloatFunction(Math.cos),
  parameterCount: 1,
};

const atan: NativeLibraryLambda = {
  type: floatToFloatType,
  body: bindFloatFunction(Math.atan),
  parameterCount: 1,
};

const asin: NativeLibraryLambda = {
  type: floatToFloatType,
  body: bindFloatFunction(Math.asin),
  parameterCount: 1,
};

const acos: NativeLibraryLambda = {
  type: floatToFloatType,
  body: bindFloatFunction(Math.acos),
  parameterCount: 1,
};

export const trigonometry: Library = {
  nativeLambdas: {
    tan,
    sin,
    cos,
    atan,
    asin,
    acos,
  },
};
