import { convergeTypes } from './converge-types';
import {
  DataType,
  ImplementationType,
  InterfaceConstraint,
  Type,
  TypeScope, TypeVariable,
} from './type';
import { expect } from 'chai';

const emptyScope: TypeScope = {
  parent: null,
  variables: {},
  implementations: {},
};


// function implementation(
//   interfaceName: string,
//   parameters: ParameterType[],
//   interfaceConstraints: InterfaceConstraint[] = [],
// ): ImplementationType {
//   return {
//     interfaceName,
//     interfaceConstraints,
//     parameters,
//     kind: 'ImplementationType',
//   };
// }
//
// function scope(implementations: Dictionary<ImplementationType[]>): TypeScope {
//   return {
//     implementations,
//     parent: null,
//     variables: {},
//   };
// }

function dataType(name: string | TypeVariable, parameters: (DataType | TypeVariable)[] = []): DataType {
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
  realType: DataType,
  interfaceConstraints: InterfaceConstraint[] = [],
): Type {
  return {
    realType,
    interfaceConstraints,
    kind: 'Type',
  };
}

describe('convergeTypes', () => {
  it('should converge two matching data types', () => {
    expect(convergeTypes(
      emptyScope,
      type(dataType('Float')),
      type(dataType('Float')),
    )).to.deep.equal(type(dataType('Float')));
  });

  it('should not converge two mismatching data types', () => {
    expect(convergeTypes(
      emptyScope,
      type(dataType('Float')),
      type(dataType('Integer')),
    )).to.deep.equal(null);
  });

  it('should converge two data types with matching parameters', () => {
    expect(convergeTypes(
      emptyScope,
      type(dataType('List', [dataType('Float')])),
      type(dataType('List', [dataType('Float')])),
    )).to.deep.equal(type(dataType('List', [dataType('Float')])));
  });

  it('should converge not two data types with mismatching parameters', () => {
    expect(convergeTypes(
      emptyScope,
      type(dataType('List', [dataType('Float')])),
      type(dataType('List', [dataType('Integer')])),
    )).to.deep.equal(null);

    expect(convergeTypes(
      emptyScope,
      type(dataType('List', [dataType('Integer')])),
      type(dataType('List', [dataType('Float')])),
    )).to.deep.equal(null);
  });

  it('should converge a data type with a type variable', () => {
    expect(convergeTypes(
      emptyScope,
      type(dataType(typeVariable('A'), [])),
      type(dataType('Float')),
    )).to.deep.equal(dataType('Float'));

    expect(convergeTypes(
      emptyScope,
      type(dataType('Float')),
      type(dataType(typeVariable('A'), [])),
    )).to.deep.equal(dataType('Float'));
  });
});
