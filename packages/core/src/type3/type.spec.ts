import {
  isSubtype,
  TypeLiteral,
  TypeStar,
  TypeVariable,
  TypeUnit,
  TypeApplication,
  TypeConstraints,
  TypeScope, Type, InterfaceImplementation, Interface,
} from './type';
import { expect } from 'chai';
import { keyBy, groupBy, Many, castArray } from 'lodash';

const emptyScope: TypeScope = {
  kind: 'TypeScope',
  values: {},
  interfaces: {},
  implementations: {},
};

function scope(implementations: Many<InterfaceImplementation> = [], interfaces: Many<Interface> = []): TypeScope {
  return {
    kind: 'TypeScope',
    values: {},
    implementations: groupBy(castArray(implementations), 'interfaceName'),
    interfaces: keyBy(castArray(interfaces), 'name'),
  };
}

function interfaceImplementation(interfaceName: string, type: TypeUnit, parameters: TypeUnit[] = [], constraints: TypeConstraints = {}): InterfaceImplementation {
  return {
    interfaceName,
    type,
    parameters,
    constraints,
    kind: 'InterfaceImplementation',
  };
}

function typeStar(): TypeStar {
  return {
    kind: 'TypeStar',
  };
}

function typeLiteral(name: string): TypeLiteral {
  return {
    name,
    kind: 'TypeLiteral',
  };
}

function typeVariable(name: string): TypeVariable {
  return {
    name,
    kind: 'TypeVariable',
  };
}

function typeApplication(callee: TypeUnit, parameters: TypeUnit[]): TypeApplication {
  return {
    callee,
    parameters,
    kind: 'TypeApplication',
  };
}

function type(realType: TypeUnit, constraints: TypeConstraints = {}): Type {
  return {
    realType,
    constraints,
    kind: 'Type',
  };
}

describe('isSubtype', () => {
  it('should return true for a type star and a type literal', () => {
    expect(isSubtype(emptyScope, type(typeStar()), type(typeLiteral('Integer')))).to.equal(true);
  });

  it('should return true for a type star and a type variable', () => {
    expect(isSubtype(emptyScope, type(typeStar()), type(typeVariable('A')))).to.equal(true);
  });

  it('should return true for a type star and a type application', () => {
    expect(isSubtype(emptyScope, type(typeStar()), type(typeApplication(typeLiteral('Monad'), [typeVariable('A')])))).to.equal(true);
  });

  it('should return true for a type star and a type star', () => {
    expect(isSubtype(emptyScope, type(typeStar()), type(typeStar()))).to.equal(true);
  });

  it('should return true for two matching type literals', () => {
    expect(isSubtype(emptyScope, type(typeLiteral('Float')), type(typeLiteral('Float')))).to.equal(true);
  });

  it('should return false for two mismatching type literals', () => {
    expect(isSubtype(emptyScope, type(typeLiteral('Float')), type(typeLiteral('Integer')))).to.equal(false);
  });

  it('should return false for a type literal and a type star', () => {
    expect(isSubtype(emptyScope, type(typeLiteral('Float')), type(typeStar()))).to.equal(false);
  });

  it('should return false for a type literal and a type variable', () => {
    expect(isSubtype(emptyScope, type(typeLiteral('Float')), type(typeVariable('A')))).to.equal(false);
  });

  it('should return false for a type literal and a type application', () => {
    expect(isSubtype(emptyScope, type(typeLiteral('Float')), type(typeApplication(typeLiteral('Float'), [typeVariable('A')])))).to.equal(false);
  });

  it('should return true for a type variable and a type literal', () => {
    expect(isSubtype(emptyScope, type(typeVariable('A')), type(typeLiteral('Integer')))).to.equal(true);
  });

  it('should return true for two type variables', () => {
    expect(isSubtype(emptyScope, type(typeVariable('A')), type(typeVariable('B')))).to.equal(true);
  });

  it('should return true for two type variables with interface constraints', () => {
    expect(isSubtype(
      emptyScope,
      type(typeVariable('A'), { A: typeLiteral('Number') }),
      type(typeVariable('B'), { B: typeLiteral('List') }),
    )).to.equal(true);
  });

  it('should return true for a type variable with interface constraints and a type literal', () => {
    expect(isSubtype(
      scope(interfaceImplementation('Number', typeLiteral('Integer'))),
      type(typeVariable('A'), { A: typeLiteral('Number') }),
      type(typeLiteral('Integer')),
    )).to.equal(true);
  });

  it('should return false for a type variable with interface constraints that aren\'t satisfied', () => {
    expect(isSubtype(
      emptyScope,
      type(typeVariable('A'), { A: typeLiteral('Number') }),
      type(typeLiteral('Integer')),
    )).to.equal(false);
  });

  it('should return false for a type variable with interface constraints that aren\'t satisfied by a parameter', () => {
    expect(isSubtype(
      scope(interfaceImplementation(
        'Equal',
        typeApplication(typeLiteral('List'), [typeVariable('A')]),
        [],
        { A: typeLiteral('Equal'), },
      )),
      type(typeVariable('A'), { A: typeLiteral('Equal') }),
      type(typeApplication(typeLiteral('List'), [typeLiteral('Integer')])),
    )).to.equal(false);
  });

  it('should return true for a type variable with interface constraints that are satisfied by a parameter', () => {
    expect(isSubtype(
      scope([
        interfaceImplementation(
          'Equal',
          typeApplication(typeLiteral('List'), [typeVariable('A')]),
          [],
          { A: typeLiteral('Equal'), },
        ),
        interfaceImplementation('Equal', typeLiteral('Integer')),
      ]),
      type(typeVariable('A'), { A: typeLiteral('Equal') }),
      type(typeApplication(typeLiteral('List'), [typeLiteral('Integer')])),
    )).to.equal(true);
  });
});
