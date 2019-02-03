import { Dictionary } from 'lodash';
import { FunctionExpression } from './expression';
import { FunctionType, Type, TypeInterface, VariableType } from './type/type';

export interface InterfaceShorthand {
  parameters?: VariableType[];
  fields?: Dictionary<Type>;
  methods?: Dictionary<FunctionType>;
}

export interface InterfaceType extends TypeInterface<'Interface'> {
  // TODO this will need to be changed from VariableType to another kind of variable that doesn't have an instance
  parameters: VariableType[];
  fields: Dictionary<Type>;
  methods: Dictionary<FunctionType>;
}

export function makeInterface({ parameters, fields, methods }: InterfaceShorthand): InterfaceType {
  return {
    kind: 'Interface',
    parameters: parameters || [],
    fields: fields || {},
    methods: methods || {},
  };
}

export interface ImplementationShorthand {
  parameters?: Type[];
  fields?: Dictionary<FunctionExpression>;
  methods?: Dictionary<FunctionExpression>;
}

export function makeImplementation({ parameters, fields, methods }: ImplementationShorthand): {
  parameters: Type[];
  fieldDefinitions: Dictionary<FunctionExpression>;
  methodDefinitions: Dictionary<FunctionExpression>;
} {
  return {
    parameters: parameters || [],
    fieldDefinitions: fields || {},
    methodDefinitions: methods || {},
  };
}
