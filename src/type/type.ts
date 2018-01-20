import {
  assign,
  Dictionary,
  get,
  map,
  mapValues,
  reduce,
  reduceRight,
} from 'lodash';
import { assertNever } from '../utils';
import { isTypeOf } from './is-type-of';


// TODO turn into an enum
export type TypeKind = 'Integer'
  | 'Float'
  | 'String'
  | 'Boolean'
  | 'None'
  | 'Array'
  | 'Function'
  | 'Union'
  | 'Generic'
  | 'Record';

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
  | GenericType
  | RecordType;

// Basic types
export interface IntegerType extends TypeInterface<'Integer'> {}
export interface FloatType extends TypeInterface<'Float'> {}
export interface StringType extends TypeInterface<'String'> {}
export interface BooleanType extends TypeInterface<'Boolean'> {}
export interface NoneType extends TypeInterface<'None'> {} // TODO change to placeholder
export interface ArrayType extends TypeInterface<'Array'> {
  elementType: Type | null;
}
export interface RecordType extends TypeInterface<'Record'> {
  fields: Record<string, Type>;
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
  derives: Type | null;
}

export type TypeShorthand = string | Type;

function evaluateShorthand(type: TypeShorthand): Type {
  if (typeof type === 'string') {
    return makeGenericType(type);
  }
  return type;
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
export function makeFunctionType(argTypes: TypeShorthand[], returnType: TypeShorthand): FunctionType {
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

export function makeGenericType(name: string, derives: TypeShorthand | null = null): GenericType {
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
  types = reduceRight(reduce(types, combineTypes, []), combineTypes, []);

  if (types.length === 1) {
    return types[0];
  }
  return {
    kind: 'Union',
    types: types,
  };
}


export function createGenericMap(generic: Type | null, concrete: Type | null): Dictionary<Type> {
  if (!generic
    || !concrete
    || generic.kind !== 'Generic' && generic.kind !== concrete.kind) {
    return {};
  }

  switch(generic.kind) {
    case 'Generic':
      return {
        [generic.name]: concrete,
      };

    case 'Array':
      const genericElement = generic.elementType;
      const concreteElement = (concrete as ArrayType).elementType;
      return createGenericMap(genericElement, concreteElement);

    case 'Function':
      // Create a generic map of the arguments
      let genericMap = {};
      let genericArgs = generic.argTypes;
      let concreteArgs = (concrete as FunctionType).argTypes;
      let i = -1;
      while (++i < genericArgs.length && i < concreteArgs.length) {
        genericMap = assign(
          genericMap,
          createGenericMap(genericArgs[i], concreteArgs[i])
        );
      }

      // Create a generic map of the return types
      const concreteReturnType = (concrete as FunctionType).returnType;
      genericMap = assign(
        genericMap,
        createGenericMap(generic.returnType, concreteReturnType),
      );
      return genericMap;

    case 'Record':
      // TODO
      return {};

    case 'Union':
      let genericMaps = map(generic.types, type => {
        return createGenericMap(type, concrete)
      });
      return assign({}, ...genericMaps);

    case 'Integer':
    case 'Float':
    case 'Boolean':
    case 'String':
    case 'None':
      return {};

    default:
      return assertNever(generic);
  }
}

export function applyGenericMap(generic: Type, genericMap: Dictionary<Type>): Type {
  switch (generic.kind) {
    case 'Generic':
      return get(genericMap, generic.name, generic);

    case 'Array':
      const elementType = generic.elementType;
      if (elementType) {
        return makeArrayType(applyGenericMap(elementType, genericMap));
      }
      return generic;

    case 'Function':
      let returnType = applyGenericMap(generic.returnType, genericMap);
      let argTypes = map(generic.argTypes, arg => {
        return applyGenericMap(arg, genericMap);
      });
      return makeFunctionType(argTypes, returnType);

    case 'Union':
      return makeUnionType(map(generic.types, type => {
        return applyGenericMap(type, genericMap)
      }));

    case 'Record':
      // TODO
      return generic;

    case 'Integer':
    case 'Float':
    case 'String':
    case 'Boolean':
    case 'None':
      return generic;

    default:
      return assertNever(generic);
  }
}
