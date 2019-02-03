import { assign, map, mapValues, Dictionary } from 'lodash';
import { FunctionType, Type } from './type/type';
import { LazyValue, makeFunctionValue, PlainFunctionValue } from './value';
import { Implementation, Scope } from './scope';
import { Expression, FunctionExpression, MethodExpression } from './expression';
import { InterfaceType } from './qlang';

export interface LibraryFunction {
  type: Type;
  impl: PlainFunctionValue;
}

export type NativeFunctionValue = (...args: LazyValue[]) => LazyValue;

export interface NativeFunction {
  type: Type;
  implementation: NativeFunctionValue;
}

export interface Library {
  nativeFunctions?: {
    [name: string]: NativeFunction;
  };
  interfaces?: {
    [name: string]: InterfaceType;
  };
  implementations?: {
    [interfaceName: string]: Implementation[]
  };
}

export function mergeLibraries(...libraries: Library[]): Library {
  return {
    nativeFunctions: assign({}, ...map(libraries, 'nativeFunctions')),
    interfaces: assign({}, ...map(libraries, 'interfaces')),
    implementations: assign({}, ...map(libraries, 'implementations')),
  };
}

export function convertNativeToExpression(native: NativeFunction): FunctionExpression {
  // TODO native functions should be mapped to type called 'NativeFunction'
  return {
    kind: 'Function',
    tokens: [],
    value: makeFunctionValue(() => native.implementation),
    resultType: native.type,
    argumentNames: [],
    implementationNames: [],
  };
}

export function convertToScope(library: Library): Scope {
  const methodTypes = map(library.interfaces, 'methods').reduce(
    (methodMap, methods) => ({...methodMap, ...methods }),
    {} as Dictionary<FunctionType>,
  );
  return {
    types: {},
    implementations: {},
    interfaces: library.implementations || {},
    variables: {
      ...mapValues(methodTypes, (type, name): MethodExpression => ({
        kind: 'Method',
        resultType: type,
        tokens: [],
        methodName: name,
        argumentNames: [],
        implementationNames: ['self'],
      })),
      ...mapValues(library.nativeFunctions, convertNativeToExpression),
    },
  };
}
