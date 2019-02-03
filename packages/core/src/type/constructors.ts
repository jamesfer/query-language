import { Dictionary, map, mapValues } from 'lodash';
import { uniqueIdentifier } from '../utils';
import {
  ArrayType,
  BooleanType,
  FloatType,
  FunctionType,
  IntegerType,
  InterfaceRestriction,
  NoneType,
  RecordType,
  StringType,
  Type,
  VariableType,
} from './type';

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

export function makeTypeVariable(name: string, identifier = uniqueIdentifier()): VariableType {
  return { name, identifier, kind: 'Variable' };
}

export function makeFunctionType(
  interfaceRestrictions: InterfaceRestriction[],
  argTypes: TypeShorthand[],
  returnType: TypeShorthand,
): FunctionType {
  const evaluator = evaluateShorthand();
  return {
    interfaceRestrictions,
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

