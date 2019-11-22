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
  Value, BoundVariable, Record,
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

export function record(values: { [k: string]: LazyValue }): Record {
  return {
    values,
    kind: ValueKind.Record,
  };
}

export const anything: Anything = {
  kind: ValueKind.Anything,
};

export const nothing: Nothing = {
  kind: ValueKind.Nothing,
};

export const stringType = userDefinedLiteral('String');

export const integerType = userDefinedLiteral('Integer');

export const floatType = userDefinedLiteral('Float');

export const booleanType = userDefinedLiteral('Boolean');

export const listLiteralType = userDefinedLiteral('List');

export function listType(elementType: LazyValue) {
  return application(lazyValue(listLiteralType), lazyList([elementType]));
}

// export const recordLiteralType = userDefinedLiteral('record');
//
// export const recordPairLiteralType = userDefinedLiteral('recordPair');
//
// export function recordType(properties: { [k: string]: LazyValue }) {
//   const keys = sortBy(Object.keys(properties));
//   return application(lazyValue(recordLiteralType), lazyList(keys.map(key => (
//     lazyValue(application(lazyValue(recordPairLiteralType), lazyList([
//       lazyValue(string(key)),
//       properties[key],
//     ])))
//   ))));
// }

export const functionLiteralType = userDefinedLiteral('function');

export function functionType(...parameters: LazyValue[]): LazyValue {
  // const [first, ...rest] = parameters;
  // if (!first) {
  //   throw new Error('Cannot create a lambda type with no parameters');
  // }
  //
  // // if (!second) {
  // //   return first;
  // // }
  //
  // return lazyValue(application(lazyValue(functionLiteralType), rest.length === 0
  //   ? lazyList([first])
  //   : lazyList([first, functionType(...rest)]),
  // ));


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
