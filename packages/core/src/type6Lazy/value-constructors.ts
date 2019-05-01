import { uniqueIdentifier } from '../utils';
import {
  Anything, Application,
  Boolean,
  Float,
  Integer, Lambda, LazyValue,
  LazyValueList,
  List,
  Nothing,
  String,
  TypeInterface,
  UnboundVariable,
  UserDefinedLiteral, Value,
  ValueKind,
} from './value';

export function userDefinedLiteral(name: string): UserDefinedLiteral {
  return {
    name,
    kind: ValueKind.UserDefinedLiteral,
  };
}

export function typeInterface(name: string): TypeInterface {
  return {
    name,
    kind: ValueKind.TypeInterface,
  };
}

export function unboundVariable(name: string): UnboundVariable {
  return {
    name,
    kind: ValueKind.UnboundVariable,
    uniqueIdentifier: uniqueIdentifier(),
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

const listLiteralType = userDefinedLiteral('list');

export function listType(elementType: LazyValue) {
  return application(async () => listLiteralType, lazyList([elementType]));
}

const functionLiteralType = userDefinedLiteral('function');

export function functionType(...parameters: LazyValue[]) {
  return application(async () => functionLiteralType, lazyList(parameters))
}
