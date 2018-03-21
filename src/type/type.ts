import { assign, Dictionary, get, map, } from 'lodash';
import { assertNever } from '../utils';
import { makeArrayType, makeFunctionType } from './constructors';
import { MethodExpression } from '../expression';


// TODO turn into an enum
export type TypeKind = 'Integer'
  | 'Float'
  | 'String'
  | 'Boolean'
  | 'None'
  | 'Array'
  | 'Function'
  | 'Generic'
  | 'Interface'
  // | 'Method'
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
  | GenericType
  | InterfaceType
  // | MethodType
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

export interface GenericType extends TypeInterface<'Generic'> {
  name: string;
  derives: Type | null;
}

// export interface MethodType extends TypeInterface<'Method'> {
//   signature: FunctionType,
//   implementations: Dictionary<Type>,
// }

export interface InterfaceType extends TypeInterface<'Interface'> {
  fields: Dictionary<Type>,
  methods: Dictionary<MethodExpression>,
}

// Utility Functions


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

    case 'Interface':
    case 'Record':
      // TODO
      return {};

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

    case 'Interface':
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
