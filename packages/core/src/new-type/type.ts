import { arrayEqualBy } from './utils';
import { uniqWith } from 'lodash';

export interface InterfaceDefinition {
  kind: 'InterfaceDefinition';
  name: string;
  constraints: InterfaceConstraint[];
  parameters: TypeVariable[];
}

export interface ImplementationType {
  kind: 'ImplementationType';
  interfaceName: string;
  interfaceConstraints: InterfaceConstraint[];
  parameters: TypeVariable[];
}

export interface TypeScope {
  /**
   * The parent scope of this one
   */
  parent: TypeScope | null;

  /**
   * A dictionary of variable identifiers and their types.
   */
  variables: {
    [k: string]: Type;
  };

  /**
   * A dictionary of interface names and their definitions.
   */
  interfaces: {
    [k: string]: InterfaceDefinition;
  };

  /**
   * A dictionary of interface names and all their implementations.
   */
  implementations: {
    [k: string]: ImplementationType[];
  };
}

/**
 * Types may have additional interface constraints placed on their type variables.
 */
export interface InterfaceConstraint {
  kind: 'InterfaceConstraint';
  name: string;
  parameters: TypeVariable[];
}

/**
 * Polymorphic types have type variables as their arguments
 */
export interface TypeVariable {
  kind: 'TypeVariable';
  name: string;
}

/**
 * The DataType interface is the primary representation of the available types in the language.
 * While every variable with have a {@see Type} associated with it, the DataType interface
 * describes the exact types allowed in the language.
 */
export interface DataType {
  kind: 'DataType';
  name: string;
  parameters: ParameterType[];
}

/**
 * The Parameter interface is the primary representation of the available types in the language.
 * While every variable with have a {@see Type} associated with it, the ParameterType interface
 * encapsulates the different kinds of types available being the {@see FunctionType} and the
 * {@see DataType}.
 */
export type ParameterType =
  | FunctionType
  | DataType
  | TypeVariable;

export interface InterfaceVariable {
  kind: 'InterfaceVariable';
  name: string;
  parameters: ParameterType[];
}

export type FunctionParameter =
  | ParameterType
  | InterfaceVariable;

/**
 * The interface for function types without interface parameters.
 */
export interface FunctionType {
  kind: 'FunctionType';
  parameters: FunctionParameter[];
  result: FunctionParameter;
}

/**
 * Every variable has a type represented by this interface. It contains the actual type and a list
 * of interface constraints for the variables in the real type. Interface constraints should only be
 * specified at the highest level of a complex type, hence why there is the {@see ParameterType}
 * interface that doesn't contain the interface constraints.
 */
export interface Type {
  kind: 'Type';
  realType: FunctionType;
  interfaceConstraints: InterfaceConstraint[];
}





// TODO move these into a different file

export function typeVariablesEqual(left: TypeVariable, right: TypeVariable): boolean {
  return left.name === right.name;
}

export function interfaceConstraintsEqual(
  left: InterfaceConstraint,
  right: InterfaceConstraint,
): boolean {
  return left.name === right.name
    && arrayEqualBy(left.parameters, right.parameters, typeVariablesEqual);
}

export function interfaceConstraintContainsParameter(
  { parameters }: InterfaceConstraint,
  variable: TypeVariable,
): boolean {
  return parameters.some(parameter => typeVariablesEqual(parameter, variable));
}

export function interfaceConstraintReplaceParameter(
  { kind, name, parameters }: InterfaceConstraint,
  searchVariable: TypeVariable,
  substituteVariable: TypeVariable,
): InterfaceConstraint {
  return {
    kind,
    name,
    parameters: parameters.map(parameter => (
     typeVariablesEqual(parameter, searchVariable) ? substituteVariable : parameter
    )),
  };
}

export function interfaceConstraintReplaceAllParameters(
  constraint: InterfaceConstraint,
  searchVariables: TypeVariable[],
  substituteVariables: TypeVariable[],
): InterfaceConstraint {
  return searchVariables.reduce(
    (newConstraint, searchVariable, index) => (
      interfaceConstraintReplaceParameter(newConstraint, searchVariable, substituteVariables[index])
    ),
    constraint,
  );
}

export function joinInterfaceConstraints(
  ...constraintsArray: InterfaceConstraint[][],
): InterfaceConstraint[] {
  const allConstraints = ([] as InterfaceConstraint[]).concat(...constraintsArray);
  return uniqWith(allConstraints, interfaceConstraintsEqual);
}
