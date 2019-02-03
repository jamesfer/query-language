import { assign, Dictionary, get, map } from 'lodash';
import { assertNever } from '../utils';
import { makeArrayType, makeFunctionType } from './constructors';

// TODO turn into an enum
export type TypeKind = 'Integer'
  | 'Float'
  | 'String'
  | 'Boolean'
  | 'None'
  | 'Array'
  | 'Function'
  | 'Variable'
  | 'Interface'
  | 'Record';

export type Type = IntegerType
  | FloatType
  | BooleanType
  | StringType
  | NoneType
  | ArrayType
  | FunctionType
  | VariableType
  // | InterfaceType
  | RecordType;

export interface TypeInterface<K extends TypeKind> {
  kind: K;
}

// Basic types
export interface IntegerType extends TypeInterface<'Integer'> {}
export interface FloatType extends TypeInterface<'Float'> {}
export interface StringType extends TypeInterface<'String'> {}
export interface BooleanType extends TypeInterface<'Boolean'> {}
export interface NoneType extends TypeInterface<'None'> {} // TODO change to placeholder
export interface ArrayType extends TypeInterface<'Array'> {
  elementType: Type;
}

// Advanced types
export interface InterfaceRestriction {
  interfaceName: string;
  args: VariableType[];
}

export interface FunctionType extends TypeInterface<'Function'> {
  interfaceRestrictions: InterfaceRestriction[];
  argTypes: Type[];
  returnType: Type;
}

export interface VariableType extends TypeInterface<'Variable'> {
  name: string;
  identifier: string;
}

// TODO maybe remove these for now
// TODO record type could be removed as it is equivalent to an interface with no methods
export interface RecordType extends TypeInterface<'Record'> {
  fields: Dictionary<Type>;
}


// Utility Functions

export function createGenericMap(generic: Type | null, concrete: Type | null): Dictionary<Type> {
  if (!generic
    || !concrete
    || generic.kind !== 'Variable' && generic.kind !== concrete.kind) {
    return {};
  }

  switch (generic.kind) {
    case 'Variable':
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
      const genericArgs = generic.argTypes;
      const concreteArgs = (concrete as FunctionType).argTypes;
      for (let i = 0; i < genericArgs.length && i < concreteArgs.length; i += 1) {
        genericMap = assign(
          genericMap,
          createGenericMap(genericArgs[i], concreteArgs[i]),
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
    case 'Variable':
      return get(genericMap, generic.name, generic);

    case 'Array':
      const elementType = generic.elementType;
      if (elementType) {
        return makeArrayType(applyGenericMap(elementType, genericMap));
      }
      return generic;

    case 'Function':
      const returnType = applyGenericMap(generic.returnType, genericMap);
      const argTypes = map(generic.argTypes, arg => applyGenericMap(arg, genericMap));
      return makeFunctionType(generic.interfaceRestrictions, argTypes, returnType);

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
