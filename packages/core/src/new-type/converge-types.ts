import { assertNever } from '../utils';
import {
  DataType, FunctionParameter, FunctionType,
  InterfaceConstraint,
  interfaceConstraintContainsParameter, interfaceConstraintReplaceAllParameters,
  interfaceConstraintReplaceParameter,
  interfaceConstraintsEqual, InterfaceVariable, joinInterfaceConstraints, ParameterType,
  Type,
  TypeScope,
  TypeVariable,
} from './type';

const emptyResult: [any[], null] = [[], null];

function dataType(name: string, parameters: ParameterType[]): DataType {
  return {
    name,
    parameters,
    kind: 'DataType',
  };
}

function maybeDataType(
  name: string | null,
  parameters: (DataType | TypeVariable)[] | null,
): DataType | null {
  if (name === null || parameters === null) {
    return null;
  }

  return dataType(name, parameters);
}

function functionType(
  parameters: FunctionParameter[],
  result: FunctionParameter,
): FunctionType {
  return {
    parameters,
    result,
    kind: 'FunctionType',
  };
}

function interfaceVariable(
  name: string,
  parameters: ParameterType[],
): InterfaceVariable {
  return {
    name,
    parameters,
    kind: 'InterfaceVariable',
  };
}










function convergeDataTypesOrVariables(
  scope: TypeScope,
  left: DataType | TypeVariable,
  right: DataType | TypeVariable,
  leftConstraints: InterfaceConstraint[],
  rightConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], DataType | null] {
  if (left.kind === 'DataType') {
    if (right.kind === 'TypeVariable') {
      // It just makes it easier to have the variable on the left
      return convergeDataTypesOrVariables(scope, right, left, rightConstraints, leftConstraints);
    }

    if (typeof left.name === 'string') {
      if (typeof right.name === 'string') {
        // If both left and right have string names, the names must match
        if (left.name !== right.name) {
          return [[], null];
        }
        const [constraints, parameters] = convergeParameters(
          scope,
          left.parameters,
          right.parameters,
          leftConstraints,
          rightConstraints,
        );
        const dataType = maybeDataType(left.name, parameters);
        return dataType ? [constraints, dataType] : [[], null];
      }

      // If left is a concrete type and right is a variable
      // TODO call function
      return [[], null];
    }

    // If left is a variable and right is a concrete type
    if (typeof right.name === 'string') {
      // TODO call function
      return [[], null];
    }

    // Both left and right have a variable name
    const [constraints, convergedName] = convergeTypeVariables(
      scope,
      left.name,
      right.name,
      leftConstraints,
      rightConstraints,
    );
    const [parameterConstraints, convergedParameters] = convergeParameters(
      scope,
      left.parameters,
      right.parameters,
      leftConstraints,
      rightConstraints,
    );
    if (convergedName && convergedParameters) {
      return [
        [...constraints, ...parameterConstraints],
        dataType(convergedName, convergedParameters),
      ]
    }
  }

  return [[], null];
}

















function convergeParameters(
  scope: TypeScope,
  leftParameters: ParameterType[],
  rightParameters: ParameterType[],
  leftConstraints: InterfaceConstraint[],
  rightConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], (DataType | TypeVariable)[] | null] {
  if (leftParameters.length !== rightParameters.length) {
    return [[], null];
  }

  const [constraints, convergedParameters] = leftParameters
    .reduce<[InterfaceConstraint[], (DataType | TypeVariable | null)[]]>(
      ([allConstraints, parameters], leftParameter, index) => {
        const [nextConstraints, nextParameter] = convergeDataTypesOrVariables(
          scope,
          leftParameter,
          rightParameters[index],
          leftConstraints,
          rightConstraints,
        );
        allConstraints.push(...nextConstraints);
        parameters.push(nextParameter);
        return [allConstraints, parameters];
      },
      [[], []],
    );
  return convergedParameters.every(parameter => parameter !== null)
    ? [constraints, convergedParameters as (DataType | TypeVariable)[]] : [[], null];
}

function convergeVariableAndOtherType(
  scope: TypeScope,
  variable: DataType<TypeVariable>,
  other: DataType<string>,
  variableConstraints: InterfaceConstraint[],
  dataConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], ParameterType | null] {
  const interfaceDefinition = scope.interfaces[variable.name.name];
  if (interfaceDefinition.parameters.length !== other.parameters.length) {
    // If they have parameters of different lengths, they cannot be converged
    return emptyResult;
  }

  // Determine the constraints implied by the interface
  const interfacesConstraints = interfaceDefinition.constraints.map(constraint => (
    interfaceConstraintReplaceAllParameters(
      constraint,
      interfaceDefinition.parameters,
      other.parameters,
    )
  ));

  // Transform constraints implied straight to the variable


  // Check if an implementation exists that satisfies all the constraints


  return emptyResult;
}

function convergeTypeVariables(
  scope: TypeScope,
  left: TypeVariable,
  right: TypeVariable,
  leftConstraints: InterfaceConstraint[],
  rightConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], TypeVariable] {
  // Filter the left constraints that have the left type variable in them
  const filteredLeftConstraints = leftConstraints.filter(constraint => (
    interfaceConstraintContainsParameter(constraint, left)
  ));

  // Filter the right constraints that have the right variable in them
  const mappedRightConstraints = rightConstraints.filter(constraint => (
    interfaceConstraintContainsParameter(constraint, right)
  ))
  // Replace occurrences of the right parameter with the left
    .map((constraint): InterfaceConstraint => (
      interfaceConstraintReplaceParameter(constraint, right, left)
    ));

  const newConstraints = [
    ...filteredLeftConstraints,
    ...mappedRightConstraints.filter(rightConstraint => (
      filteredLeftConstraints.every(leftConstraint => (
        !interfaceConstraintsEqual(leftConstraint, rightConstraint)
      ))
    ))
  ];
  return [newConstraints, left];
}

function convergeDataTypes(
  scope: TypeScope,
  left: DataType,
  right: DataType,
  leftConstraints: InterfaceConstraint[],
  rightConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], DataType | null] {
  if (left.name === right.name) {
    const [constraints, parameters] = convergeParameters(
      scope,
      left.parameters,
      right.parameters,
      leftConstraints,
      rightConstraints,
    );
    if (parameters) {
      return [constraints, dataType(left.name, parameters)];
    }
  }
  return emptyResult;
}

function lookupInterface(
  scope: TypeScope,
  variable: InterfaceVariable,
  variableConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], InterfaceVariable | null] {
  const definition = scope.interfaces[variable.name];
  if (variable.parameters.length !== definition.parameters.length) {
    return emptyResult;
  }

  const [constraints, parameters] = convergeParameters(
    scope,
    definition.parameters,
    variable.parameters,
    definition.constraints,
    variableConstraints,
  );
  return [constraints, parameters ? interfaceVariable(variable.name, parameters) : null];
}

function convergeInterfaceVariables(
  scope: TypeScope,
  left: InterfaceVariable,
  right: InterfaceVariable,
  leftVariableConstraints: InterfaceConstraint[],
  rightVariableConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], InterfaceVariable | null] {
  // Apply the constraints from the interface of both variables
  const [leftConstraints, leftVariable] = lookupInterface(scope, left, leftVariableConstraints);
  const [rightConstraints, rightVariable] = lookupInterface(scope, right, rightVariableConstraints);

  // const leftInterfacesConstraints = leftDefinition.constraints.map(constraint => (
  //   interfaceConstraintReplaceAllParameters(constraint, leftDefinition.parameters, left.parameters)
  // ));
  //
  // // Filter the left constraints that have the left type variable in them
  // const filteredLeftConstraints = leftConstraints.filter(constraint => (
  //   interfaceConstraintContainsParameter(constraint, left)
  // ));
  //
  // // Filter the right constraints that have the right variable in them
  // const mappedRightConstraints = rightConstraints.filter(constraint => (
  //   interfaceConstraintContainsParameter(constraint, right)
  // ))
  // // Replace occurrences of the right parameter with the left
  //   .map((constraint): InterfaceConstraint => (
  //     interfaceConstraintReplaceParameter(constraint, right, left)
  //   ));
  //
  // const newConstraints = [
  //   ...filteredLeftConstraints,
  //   ...mappedRightConstraints.filter(rightConstraint => (
  //     filteredLeftConstraints.every(leftConstraint => (
  //       !interfaceConstraintsEqual(leftConstraint, rightConstraint)
  //     ))
  //   ))
  // ];
  // return [newConstraints, left];
}

function convergeWithInterfaceVariable(
  scope: TypeScope,
  variable: InterfaceVariable,
  other: FunctionParameter,
  variableConstraints: InterfaceConstraint[],
  otherConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], FunctionParameter | null] {
  // TODO
}

function convergeFunctionParameterTypes(
  scope: TypeScope,
  left: FunctionParameter,
  right: FunctionParameter,
  leftConstraints: InterfaceConstraint[],
  rightConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], FunctionParameter | null] {
  if (left.kind === 'InterfaceVariable') {
    if (right.kind === 'InterfaceVariable') {
      return convergeInterfaceVariables(scope, left, right, leftConstraints, rightConstraints);
    }

    return convergeWithInterfaceVariable(scope, left, right, leftConstraints, rightConstraints);
  }

  if (right.kind === 'InterfaceVariable') {
    return convergeWithInterfaceVariable(scope, right, left, rightConstraints, leftConstraints);
  }

  return convergeParameterTypes(scope, left, right, leftConstraints, rightConstraints);
}

function convergeFunctionParameters(
  scope: TypeScope,
  leftParameters: FunctionParameter[],
  rightParameters: FunctionParameter[],
  leftConstraints: InterfaceConstraint[],
  rightConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], FunctionParameter[] | null] {
  if (leftParameters.length !== rightParameters.length) {
    return [[], null];
  }

  const [constraints, convergedParameters] = leftParameters
    .reduce<[InterfaceConstraint[], (FunctionParameter | null)[]]>(
      ([allConstraints, parameters], leftParameter, index) => {
        const [nextConstraints, nextParameter] = convergeFunctionParameterTypes(
          scope,
          leftParameter,
          rightParameters[index],
          leftConstraints,
          rightConstraints,
        );
        allConstraints.push(...nextConstraints);
        parameters.push(nextParameter);
        return [allConstraints, parameters];
      },
      [[], []],
    );
  return convergedParameters.every(parameter => parameter !== null)
    ? [constraints, convergedParameters as (DataType | TypeVariable)[]] : [[], null];
}

function convergeFunctionTypes(
  scope: TypeScope,
  left: FunctionType,
  right: FunctionType,
  leftConstraints: InterfaceConstraint[],
  rightConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], FunctionType | null] {
  const [parameterConstraints, parameters] = convergeFunctionParameters(
    scope,
    left.parameters,
    right.parameters,
    leftConstraints,
    rightConstraints,
  );
  if (parameters) {
    const [resultConstraints, result] = convergeFunctionParameterTypes(
      scope,
      left.result,
      right.result,
      leftConstraints,
      rightConstraints,
    );
    if (result) {
      return [
        joinInterfaceConstraints(parameterConstraints, resultConstraints),
        functionType(parameters, result),
      ];
    }
  }
  return emptyResult;
}

function convergeParameterTypes(
  scope: TypeScope,
  left: ParameterType,
  right: ParameterType,
  leftConstraints: InterfaceConstraint[],
  rightConstraints: InterfaceConstraint[],
): [InterfaceConstraint[], ParameterType | null] {
  if (right.kind === 'TypeVariable' && left.kind !== 'TypeVariable') {
    // It is easier to have the type variable on the left hand side
    return convergeParameterTypes(scope, right, left, rightConstraints, leftConstraints);
  }

  switch (left.kind) {
    case 'DataType':
      if (right.kind === 'DataType') {
        return convergeDataTypes(scope, left, right, leftConstraints, rightConstraints);
      }
      return emptyResult;

    case 'FunctionType':
      if (right.kind === 'FunctionType') {
        return convergeFunctionTypes(scope, left, right, leftConstraints, rightConstraints);
      }
      return emptyResult;

    case 'TypeVariable':
      if (right.kind === 'TypeVariable') {
        return convergeTypeVariables(scope, left, right, leftConstraints, rightConstraints);
      }
      return convergeVariableAndOtherType(scope, left, right, );

    default:
      return assertNever(left);
  }
}

/**
 * Finds the highest common type of the given types.
 */
export function convergeTypes(
  scope: TypeScope,
  left: Type,
  right: Type,
): Type | null {
  const [interfaceConstraints, realType] = convergeFunctionTypes(
    scope,
    left.realType,
    right.realType,
    left.interfaceConstraints,
    right.interfaceConstraints,
  );
  return !realType ? null : { realType, interfaceConstraints, kind: 'Type' };
}
