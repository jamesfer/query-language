import { some, every, reduce, reduceRight } from 'lodash';
import { assertNever } from './utils';


// TODO turn into an enum
export type TypeKind = 'Integer'
  | 'Float'
  | 'String'
  | 'Boolean'
  | 'None'
  | 'Array'
  | 'Function'
  | 'Union'
  | 'Generic';

export interface TypeInterface<K extends TypeKind> {
  kind: K;
}

export type Type = IntegerType
  | FloatType
  | BooleanType
  | StringType
  | NoneType
  | ArrayType
  | FunctionType
  | UnionType
  | GenericType;

// Basic types
export interface IntegerType extends TypeInterface<'Integer'> {}
export interface FloatType extends TypeInterface<'Float'> {}
export interface StringType extends TypeInterface<'String'> {}
export interface BooleanType extends TypeInterface<'Boolean'> {}
export interface NoneType extends TypeInterface<'None'> {} // TODO change to placeholder
export interface ArrayType extends TypeInterface<'Array'> {
  elementType: Type | null;
}

// Advanced types
export interface FunctionType extends TypeInterface<'Function'> {
  argTypes: Type[];
  returnType: Type;
}

export interface UnionType extends TypeInterface<'Union'> {
  types: Type[];
}

export interface GenericType extends TypeInterface<'Generic'> {
  name: string;
}

// Type constants
export const IntegerType: IntegerType = {
  kind: 'Integer',
};
export const FloatType: FloatType = {
  kind: 'Float',
};
export const StringType: StringType = {
  kind: 'String',
};
export const BooleanType: BooleanType = {
  kind: 'Boolean',
};
export const NoneType: NoneType = {
  kind: 'None',
};

// Utility Functions
export function makeFunctionType(argTypes: Type[], returnType: Type): FunctionType {
  return {
    kind: 'Function',
    argTypes,
    returnType
  };
}

export function makeArrayType(elementType: Type | null): ArrayType {
  return {
    kind: 'Array',
    elementType,
  };
}

export function makeGenericType(name: string): GenericType {
  return {
    kind: 'Generic',
    name,
  };
}

export function makeUnionType(types: Type[]): UnionType {
  function flattenUnionTypes(types: Type[]): Type[] {
    return reduce(types, (list, type): Type[] => {
      if (type.kind === 'Union') {
        return [...list, ...flattenUnionTypes(type.types)];
      }
      return [...list, type];
    }, []);
  }
  types = flattenUnionTypes(types);

  // Only adds type to the list of existing types if it is not a subtype of the list.
  function combineTypes(list: Type[], type: Type): Type[] {
    for (let includedType of list) {
      if (isTypeOf(includedType, type)) {
        return list;
      }
    }
    return [...list, type];
  }

  return {
    kind: 'Union',
    types: reduceRight(reduce(types, combineTypes, []), combineTypes, []),
  };
}

// Type tests
export function isTypeOf(base: Type, subtype: Type): boolean {
  switch (base.kind) {
    case 'Integer':
      return isSubtypeOfInteger(subtype);
    case 'Float':
      return isSubtypeOfFloat(subtype);
    case 'String':
      return isSubtypeOfString(subtype);
    case 'Array':
      return isSubtypeOfArray(base, subtype);
    case 'Function':
      return isSubtypeOfFunction(base, subtype);
    case 'Union':
      return isSubtypeOfUnion(base, subtype);
    case 'Boolean':
      return isSubtypeOfBoolean(subtype);
    case 'None':
      return isSubtypeOfNone(subtype);
    case 'Generic':
      return isSubtypeOfGeneric(base, subtype);
    default:
      return assertNever(base);
  }
}

function isSubtypeOfInteger(subtype: Type): boolean {
  return subtype.kind === 'Integer';
}

function isSubtypeOfFloat(subtype: Type): boolean {
  return subtype.kind === 'Integer' || subtype.kind === 'Float';
}

function isSubtypeOfString(subtype: Type): boolean {
  return subtype.kind === 'String';
}

function isSubtypeOfBoolean(subtype: Type): boolean {
  return subtype.kind === 'Boolean' || isSubtypeOfFloat(subtype);
}

function isSubtypeOfNone(subtype: Type): boolean {
  return subtype.kind === 'None';
}

function isSubtypeOfArray(base: ArrayType, subtype: Type): boolean {
  if (subtype.kind !== 'Array') {
    return false;
  }

  // An empty array base type can only be satisfied by another empty array type
  if (base.elementType === null) {
    return subtype.elementType === null;
  }

  // If the subtype has no element type, it could be any type of array.
  // If it does have an element type, it must be a subtype of the array's subtype.
  return subtype.elementType ? isTypeOf(base.elementType, subtype.elementType) : true;
}

function isSubtypeOfFunction(base: FunctionType, subtype: Type): boolean {
  if (subtype.kind !== 'Function') {
    return false;
  }

  if (base.argTypes.length !== subtype.argTypes.length) {
    return false;
  }

  if (some(subtype.argTypes, (type, index) => !isTypeOf(type, base.argTypes[index]))) {
    return false;
  }

  return isTypeOf(base.returnType, subtype.returnType);
}

function isSubtypeOfUnion(base: UnionType, subtype: Type): boolean {
  if (subtype.kind === 'Union') {
    return every(subtype.types, type => isSubtypeOfUnion(base, subtype));
  }

  return some(base.types, type => isTypeOf(type, subtype));
}

function isSubtypeOfGeneric(base: GenericType, subtype: Type): boolean {
  return true;
}
