import { map, Dictionary, mapValues } from 'lodash';
import { MethodExpression } from '../expression';
import {
  ArrayType,
  BooleanType,
  FloatType,
  FunctionType,
  IntegerType,
  NoneType,
  StringType,
  Type,
  VariableType,
  RecordType,
  InterfaceType,
} from './type';
import { PlainFunctionValue } from '../value';

export type TypeShorthand = string | Type;

function evaluateShorthand() {
  const variableMap = {};
  return (type: TypeShorthand): Type => {
    if (typeof type === 'string') {
      if (variableMap[type]) {
        return variableMap[type];
      }
      return makeTypeVariable(type);
    }
    return type;
  };
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

let typeVariableIdentifier = 0;
function nextIdentifier() {
  typeVariableIdentifier += 1;
  return typeVariableIdentifier;
}

export function makeTypeVariable(name: string, identifier = nextIdentifier()): VariableType {
  return { name, identifier, kind: 'Variable' };
}

export function makeFunctionType(
  argTypes: TypeShorthand[],
  returnType: TypeShorthand,
): FunctionType {
  const evaluator = evaluateShorthand();
  return {
    kind: 'Function',
    argTypes: map(argTypes, evaluator),
    returnType: evaluator(returnType),
  };
}

export function makeArrayType(elementType: TypeShorthand): ArrayType {
  return {
    kind: 'Array',
    elementType: evaluateShorthand()(elementType),
  };
}

// export function makeGenericType(
//   name: string,
//   derives: TypeShorthand | null = null,
// ): GenericType {
//   return {
//     name,
//     kind: 'Generic',
//     derives: derives ? evaluateShorthand(derives) : null,
//   };
// }

export function makeRecordType(fields: Record<string, TypeShorthand>): RecordType {
  const evaluator = evaluateShorthand();
  return {
    kind: 'Record',
    fields: mapValues(fields, evaluator),
  };
}

export function makeMethodType(
  signature: FunctionType,
  implementations: Dictionary<Type> = {},
) {
  return {
    signature,
    implementations,
    kind: 'Method',
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
  signature: FunctionType;
  implementations: Dictionary<{ type: Type, func: PlainFunctionValue }>;
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

export interface InterfaceShorthand {
  fields?: Dictionary<TypeShorthand> | null;
  methods?: Dictionary<MethodExpression> | null;
  parents?: InterfaceType[];
}
export function makeInterfaceType({ fields, methods, parents }: InterfaceShorthand): InterfaceType {
  const evaluator = evaluateShorthand();
  return {
    kind: 'Interface',
    fields: mapValues(fields, evaluator),
    methods: methods || {},
    parents: parents || [],
  };
}
