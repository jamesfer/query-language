import { map, mapValues, reduce, reduceRight } from 'lodash';
import {
  ArrayType,
  BooleanType,
  FloatType,
  FunctionType,
  GenericType,
  IntegerType,
  NoneType,
  RecordType,
  StringType,
  Type,
} from './type';
import { isTypeOf } from './is-type-of';

export type TypeShorthand = string | Type;

function evaluateShorthand(type: TypeShorthand): Type {
  if (typeof type === 'string') {
    return makeGenericType(type);
  }
  return type;
}

export const integerType: IntegerType = {
  kind: 'Integer',
};
export const floatType: FloatType = {
  kind: 'Float',
};
export const stringType: StringType = {
  kind: 'String',
};
export const booleanType: BooleanType = {
  kind: 'Boolean',
};
export const noneType: NoneType = {
  kind: 'None',
};

export function makeFunctionType(
  argTypes: TypeShorthand[],
  returnType: TypeShorthand,
): FunctionType {
  return {
    kind: 'Function',
    argTypes: map(argTypes, evaluateShorthand),
    returnType: evaluateShorthand(returnType),
  };
}

export function makeArrayType(elementType: TypeShorthand | null): ArrayType {
  return {
    kind: 'Array',
    elementType: elementType ? evaluateShorthand(elementType) : null,
  };
}

export function makeGenericType(
  name: string,
  derives: TypeShorthand | null = null,
): GenericType {
  return {
    kind: 'Generic',
    derives: derives ? evaluateShorthand(derives) : null,
    name,
  };
}

export function makeRecordType(fields: Record<string, TypeShorthand>): RecordType {
  return {
    kind: 'Record',
    fields: mapValues(fields, evaluateShorthand),
  };
}

export function makeUnionType(shortTypes: TypeShorthand[]): Type {
  let types = map(shortTypes, evaluateShorthand);

  function flattenUnionTypes(types: Type[]): Type[] {
    return reduce(types, (list, type): Type[] => {
      if (type.kind === 'Union') {
        return [ ...list, ...flattenUnionTypes(type.types) ];
      }
      return [ ...list, type ];
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
    return [ ...list, type ];
  }

  types = reduceRight(reduce(types, combineTypes, []), combineTypes, []);

  if (types.length === 1) {
    return types[ 0 ];
  }
  return {
    kind: 'Union',
    types: types,
  };
}
