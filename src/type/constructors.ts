import { Dictionary, map, mapValues } from 'lodash';
import { PlainFunctionValue } from '../value';
import { InterfaceType } from './type';
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
import { MethodExpression } from '../expression';

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

export function makeMethodType(
  signature: FunctionType,
  implementations: Dictionary<Type> = {},
) {
  return {
    kind: 'Method',
    signature,
    implementations,
  };
}

// export function makeInterfaceType(
//   fields?: Dictionary<TypeShorthand> | null,
//   methods?: Dictionary<{
//     type: MethodType,
//     value: MethodValue
//   }> | null,
// ): InterfaceType {
//   return {
//     kind: 'Interface',
//     fields: mapValues(fields, evaluateShorthand),
//     methods: methods || {},
//   };
// }

export interface MethodShorthand {
  signature: FunctionType,
  implementations: Dictionary<{ type: Type, func: PlainFunctionValue }>,
}

// export function makeInterfaceType(
//   fields?: Dictionary<TypeShorthand> | null,
//   methods?: Dictionary<MethodShorthand> | null,
// ): InterfaceType {
//   return {
//     kind: 'Interface',
//     fields: mapValues(fields, evaluateShorthand),
//     methods: mapValues(methods, method => ({
//       type: makeMethodType(method.signature, mapValues(method.implementations, 'type')),
//       value: makeMethodValue(mapValues(method.implementations, 'func')),
//     })),
//   };
// }

export function makeInterfaceType(
  fields?: Dictionary<TypeShorthand> | null,
  methods?: Dictionary<MethodExpression> | null,
): InterfaceType {
  return {
    kind: 'Interface',
    fields: mapValues(fields, evaluateShorthand),
    methods: methods || {},
  };
}
