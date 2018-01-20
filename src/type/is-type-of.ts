import { every, some } from 'lodash';
import { assertNever } from '../utils';
import {
  ArrayType,
  FunctionType,
  GenericType,
  RecordType,
  Type,
  UnionType,
} from './type';


export function isTypeOf(base: Type, subtype?: Type | null): boolean {
  if (!subtype) {
    return false;
  }

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
    case 'Record':
      return isSubtypeOfRecord(base, subtype);
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
  return subtype.elementType
    ? isTypeOf(base.elementType, subtype.elementType)
    : true;
}

function isSubtypeOfFunction(base: FunctionType, subtype: Type): boolean {
  if (subtype.kind !== 'Function') {
    return false;
  }

  if (base.argTypes.length !== subtype.argTypes.length) {
    return false;
  }

  if (!every(
      subtype.argTypes,
      (type, index) => isTypeOf(type, base.argTypes[ index ]),
    )) {
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
  if (base.derives) {
    let type = subtype.kind === 'Generic' ? subtype.derives : subtype;
    return isTypeOf(base.derives, type);
  }
  return false;
}

function isSubtypeOfRecord(base: RecordType, subtype: Type) {
  if (subtype.kind === 'Record') {
    return every(
      base.fields,
      (field, key) => isTypeOf(field, subtype.fields[ key ]),
    );
  }
  return false;
}
