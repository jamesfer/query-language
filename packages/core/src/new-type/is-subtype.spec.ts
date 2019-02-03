import { isSubtype } from './is-subtype';
import {
  DataType,
  InterfaceConstraint,
  ParameterType,
  Type,
  TypeScope,
  TypeVariable,
  FunctionType, ImplementationType,
} from './type';
import { expect } from 'chai';
import { Dictionary } from 'lodash';

const emptyScope: TypeScope = {
  parent: null,
  variables: {},
  implementations: {},
};

function implementation(
  interfaceName: string,
  parameters: ParameterType[],
  interfaceConstraints: InterfaceConstraint[] = [],
): ImplementationType {
  return {
    interfaceName,
    interfaceConstraints,
    parameters,
    kind: 'ImplementationType',
  };
}

function scope(implementations: Dictionary<ImplementationType[]>): TypeScope {
  return {
    implementations,
    parent: null,
    variables: {},
  };
}

function dataType(name: string, parameters: ParameterType[] = []): DataType {
  return {
    name,
    parameters,
    kind: 'DataType',
  };
}

function typeVariable(name: string): TypeVariable {
  return {
    name,
    kind: 'TypeVariable',
  };
}

function functionType(parameters: ParameterType[], result: ParameterType): FunctionType {
  return {
    parameters,
    result,
    kind: 'FunctionType',
  };
}

function interfaceConstraint(
  name: string,
  parameters: TypeVariable[],
): InterfaceConstraint {
  return {
    name,
    parameters,
    kind: 'InterfaceConstraint',
  };
}

function type(
  realType: ParameterType,
  interfaceConstraints: InterfaceConstraint[] = [],
): Type {
  return {
    realType,
    interfaceConstraints,
    kind: 'Type',
  };
}

describe('isSubtype', () => {
  it('should determine two matching data types are equal', () => {
    expect(isSubtype(
      emptyScope,
      type(dataType('Integer')),
      type(dataType('Integer')),
    )).to.equal(true);
  });

  it('should determine a function type is not a subtype of a data type', () => {
    expect(isSubtype(
      emptyScope,
      type(dataType('Integer')),
      type(functionType([], dataType('Integer'))),
    )).to.equal(false);
  });

  it('should determine a type variable is not a subtype of a data type', () => {
    expect(isSubtype(
      emptyScope,
      type(dataType('Integer')),
      type(typeVariable('T')),
    )).to.equal(false);
  });

  it('should determine two mismatching data types are not equal', () => {
    expect(isSubtype(
      emptyScope,
      type(dataType('Integer')),
      type(dataType('Float')),
    )).to.equal(false);
  });

  it('should determine two data types with matching params are equal', () => {
    expect(isSubtype(
      emptyScope,
      type(dataType('Maybe', [dataType('Integer')])),
      type(dataType('Maybe', [dataType('Integer')])),
    )).to.equal(true);
  });

  it('should determine two data types with mismatching params are not equal', () => {
    expect(isSubtype(
      emptyScope,
      type(dataType('Maybe', [dataType('Integer')])),
      type(dataType('Maybe', [dataType('Float')])),
    )).to.equal(false);
  });

  it('should determine a data type with a concrete parameter is a subtype of a data type with a type variable', () => {
    expect(isSubtype(
      emptyScope,
      type(dataType('Maybe', [typeVariable('T')])),
      type(dataType('Maybe', [dataType('Float')])),
    )).to.equal(true);
  });

  it('should determine a data type with a variable parameter is not a subtype of a data type with a concrete parameter', () => {
    expect(isSubtype(
      emptyScope,
      type(dataType('Maybe', [dataType('Float')])),
      type(dataType('Maybe', [typeVariable('T')])),
    )).to.equal(false);
  });

  it('should determine two matching function types are equal', () => {
    expect(isSubtype(
      emptyScope,
      type(functionType([], dataType('Float'))),
      type(functionType([], dataType('Float'))),
    )).to.equal(true);
  });

  it('should determine a data type is not a subtype of a function type', () => {
    expect(isSubtype(
      emptyScope,
      type(functionType([], dataType('Float'))),
      type(dataType('Float')),
    )).to.equal(false);
  });

  it('should determine a type variable is not a subtype of a function type', () => {
    expect(isSubtype(
      emptyScope,
      type(functionType([], dataType('Float'))),
      type(typeVariable('T')),
    )).to.equal(false);
  });

  it('should determine a function is a subtype if its result is a subtype', () => {
    expect(isSubtype(
      emptyScope,
      type(functionType([], typeVariable('T'))),
      type(functionType([], dataType('Float'))),
    )).to.equal(true);
  });

  it('should determine a function is not a subtype if its result is not a subtype', () => {
    expect(isSubtype(
      emptyScope,
      type(functionType([], dataType('Float'))),
      type(functionType([], typeVariable('T'))),
    )).to.equal(false);
  });

  it('should determine a function is a subtype if its parameters are supertypes', () => {
    expect(isSubtype(
      emptyScope,
      type(functionType([dataType('Integer'), typeVariable('F')], dataType('Float'))),
      type(functionType([typeVariable('T'), typeVariable('T')], dataType('Float'))),
    )).to.equal(true);
  });

  it('should determine two unconstrained type variables to be equal', () => {
    expect(isSubtype(
      emptyScope,
      type(typeVariable('T')),
      type(typeVariable('U')),
    )).to.equal(true);
  });

  it('should determine two type variables to be equal if they have matching constraints', () => {
    expect(isSubtype(
      emptyScope,
      type(typeVariable('T'), [interfaceConstraint('Eq', [typeVariable('T')])]),
      type(typeVariable('U'), [interfaceConstraint('Eq', [typeVariable('U')])]),
    )).to.equal(true);
  });

  it('should determine two type variables not to be equal if the subtype is missing a constraint', () => {
    expect(isSubtype(
      emptyScope,
      type(typeVariable('T'), [interfaceConstraint('Eq', [typeVariable('T')])]),
      type(typeVariable('U')),
    )).to.equal(false);
  });

  it('should determine two type variables to be equal when multiple constraints are present', () => {
    expect(isSubtype(
      emptyScope,
      type(typeVariable('T'), [interfaceConstraint('Eq', [typeVariable('T')])]),
      type(typeVariable('U'), [
        interfaceConstraint('Eq', [typeVariable('U')]),
        interfaceConstraint('Ord', [typeVariable('U')]),
      ]),
    )).to.equal(true);
  });

  it('should determine a concrete type is a subtype of a type variable if a matching implementation exists', () => {
    expect(isSubtype(
      scope({
        Eq: [implementation('Eq', [dataType('Integer')])]
      }),
      type(typeVariable('T'), [interfaceConstraint('Eq', [typeVariable('T')])]),
      type(dataType('Integer')),
    )).to.equal(true);
  });

  it('should determine a concrete type is not a subtype of a type variable if a matching implementation does not exists', () => {
    expect(isSubtype(
      scope({
        Eq: [implementation('Eq', [dataType('Integer')])]
      }),
      type(typeVariable('T'), [interfaceConstraint('Eq', [typeVariable('T')])]),
      type(dataType('Float')),
    )).to.equal(false);
  });

  it('should determine a concrete function type is a subtype of a type variable if a matching implementation exists', () => {
    expect(isSubtype(
      scope({
        Mappable: [
          implementation('Mappable', [functionType([dataType('Integer')], dataType('Integer'))])
        ],
      }),
      type(typeVariable('T'), [interfaceConstraint('Mappable', [typeVariable('T')])]),
      type(functionType([dataType('Integer')], dataType('Integer'))),
    )).to.equal(true);
  });

  it('should determine a concrete function type is not a subtype of a type variable if a matching implementation does not exists', () => {
    expect(isSubtype(
      scope({
        Mappable: [
          implementation('Mappable', [functionType([dataType('Integer')], dataType('Integer'))])
        ],
      }),
      type(typeVariable('T'), [interfaceConstraint('Mappable', [typeVariable('T')])]),
      type(functionType([dataType('Integer')], dataType('Float'))),
    )).to.equal(false);
  });

  it('should determine a partially concrete function type is not a subtype of a type variable if a matching implementation does not exists', () => {
    expect(isSubtype(
      scope({
        Serializable: [
          implementation('Serializable', [dataType('Integer'), typeVariable('C')])
        ],
      }),
      type(functionType([dataType('Integer')], typeVariable('B')), [
        interfaceConstraint('Eq', [typeVariable('B')]),
      ]),
      type(functionType([typeVariable('A')], typeVariable('B')), [
        interfaceConstraint('Serializable', [typeVariable('A'), typeVariable('B')]),
        interfaceConstraint('Eq', [typeVariable('B')]),
      ]),
    )).to.equal(true);
  });
});
