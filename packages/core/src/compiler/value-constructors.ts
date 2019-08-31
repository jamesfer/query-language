import { uniqueIdentifier } from '../utils';
import { lazyList } from './utils';
import {
  Anything, Application,
  Boolean,
  Float,
  Integer, Lambda, LazyValue,
  LazyValueList,
  List,
  Nothing,
  String,
  UnboundVariable,
  UserDefinedLiteral,
  ValueKind,
  Value, BoundVariable,
} from './value';

export function lazyValue<V extends Value>(value: V): LazyValue<V> {
  return () => Promise.resolve(value);
}

export function userDefinedLiteral(name: string): UserDefinedLiteral {
  return {
    name,
    kind: ValueKind.UserDefinedLiteral,
  };
}

// export function typeInterface(name: string): TypeInterface {
//   return {
//     name,
//     kind: ValueKind.TypeInterface,
//   };
// }

export function unboundVariable(name: string): UnboundVariable {
  return {
    name,
    kind: ValueKind.UnboundVariable,
    uniqueIdentifier: uniqueIdentifier(),
  };
}

export function boundVariable(name: string): BoundVariable {
  return {
    name,
    kind: ValueKind.BoundVariable,
  };
}

export function lambda(parameterNames: string[], body: LazyValue): Lambda {
  return {
    parameterNames,
    body,
    kind: ValueKind.Lambda,
  };
}

export function application(callee: LazyValue, parameters: LazyValueList): Application {
  return {
    callee,
    parameters,
    kind: ValueKind.Application,
  };
}

export function integer(value: number): Integer {
  return {
    value,
    kind: ValueKind.Integer,
  };
}

export function float(value: number): Float {
  return {
    value,
    kind: ValueKind.Float,
  };
}

export function string(value: string): String {
  return {
    value,
    kind: ValueKind.String,
  };
}

export function boolean(value: boolean): Boolean {
  return {
    value,
    kind: ValueKind.Boolean,
  };
}

export function list(values: LazyValueList): List {
  return {
    values,
    kind: ValueKind.List,
  };
}

export const anything: Anything = {
  kind: ValueKind.Anything,
};

export const nothing: Nothing = {
  kind: ValueKind.Nothing,
};

export const stringType = userDefinedLiteral('string');

export const integerType = userDefinedLiteral('integer');

export const floatType = userDefinedLiteral('float');

export const booleanType = userDefinedLiteral('boolean');

export const listLiteralType = userDefinedLiteral('list');

export function listType(elementType: LazyValue) {
  return application(async () => listLiteralType, lazyList([elementType]));
}

export const functionLiteralType = userDefinedLiteral('function');

export function functionType(...parameters: LazyValue[]): LazyValue {
  // return application(lazyValue(functionLiteralType), lazyList(parameters))

  // if (parameters.length < 2) {
  //   throw new Error('Cannot create lambda type with less than two parameters');
  // }

  const [first, second, ...rest] = parameters;
  if (!first) {
    throw new Error('Cannot create a lambda type with no parameters');
  }

  if (!second) {
    return first;
  }

  return lazyValue(application(lazyValue(functionLiteralType), rest.length === 0
    ? lazyList([first, second])
    : lazyList([first, functionType(second, ...rest)]),
  ));
}

export const implicitFunctionLiteralType = userDefinedLiteral('implicitFunction');

export function implicitFunction(body: LazyValue, ...parameters: LazyValue[]) {
  return application(lazyValue(implicitFunctionLiteralType), lazyList([body, ...parameters]));
}
