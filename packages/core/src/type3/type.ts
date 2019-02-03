/**
 * Every variable has a Type.
 * Each type is made up of a DataType and a list of constraints.
 * A DataType is simply a name with a list of parameters applied to it.
 * A TypeVariable is a name for a type.
 * TypeVariables can have a higher level of constraints on them that limits the types that can
 * fulfill that variable.
 *
 * Examples:
 * // Function from types to types that takes zero parameters
 * type Ordering: LessThan | EqualTo | GreaterThan
 *
 * // Specifies that A could satisfy the Equal interface. Here Equal is a kind (or a function from
 * // types to kinds) that takes zero parameters and A is a type.
 * interface Equal -> A:
 *   =: (A, A) -> Bool
 * // Function from types to types that takes two parameters. There is only one literal
 * // representation of this type and it is Measurement(Value, Unit)
 * type Measurement<Value, Unit>: Measurement(Value, Unit)
 * // Specifies that Measurement<A> implements the Equal interface. We must "call" Measurement with
 * // its parameters because Equal does not take any parameters
 * implement Measurement<V, U> = Equal when A = Equal:
 *   =: (Measurement(valueA, unitA), Measurement(valueB, unitB)) -> valueA = valueB and unitA = unitB
 *
 * // Specifies that M could satisfy the Monad interface. Here <A> -> Monad<A> is a kind (or a
 * // function from types to kinds) that takes one parameter. This means that any type substituted
 * // for M, must also be a function.
 * interface Monad -> M when M = * -> *:
 *   bind: (M<A>, A -> M<B>) -> M<B>
 * // Create the Maybe type that takes one parameter. Here, there are two literal representations
 * // of the Maybe type.
 * type Maybe<A>: Just(A) | Nothing
 * //
 * implement Monad -> Maybe:
 *   bind: (Just(a), f) -> Just(f(a))
 *   bind: (Nothing, _) -> Nothing
 *
 * // A function that takes a single parameter. It as two type variables, M and A, and one
 * // restriction that states that M must be a type function.
 * combineM: List<M<A>> -> M<List<A>> when M = Monad
 *
 * interface ConvertibleFrom<A> -> B:
 *   convertTo: (A) -> B
 * convert: A -> B when B = ConvertibleFrom<A>
 */
import { assertNever } from '../utils';

export interface TypeStar {
  kind: 'TypeStar';
}

export interface TypeVariable {
  kind: 'TypeVariable';
  name: string;
}

export interface TypeLiteral {
  kind: 'TypeLiteral';
  name: string;
}

export interface TypeApplication {
  kind: 'TypeApplication';
  callee: TypeUnit;
  parameters: TypeUnit[];
}

export type TypeUnit =
  | TypeVariable
  | TypeLiteral
  | TypeApplication
  | TypeStar;

export interface TypeConstraints {
  [name: string]: TypeUnit;
}

export interface Type {
  kind: 'Type';
  realType: TypeUnit;
  constraints: TypeConstraints;
}

export interface Interface {
  kind: 'Interface';
  name: string;
  parameters: TypeUnit;
  constraints: TypeConstraints;
  variable: TypeVariable;
}

export interface InterfaceImplementation {
  kind: 'InterfaceImplementation';
  interfaceName: string;
  parameters: TypeUnit[];
  type: TypeUnit;
  constraints: TypeConstraints;
}

export interface TypeScope {
  kind: 'TypeScope';
  values: {
    [name: string]: Type;
  };
  interfaces: {
    [name: string]: Interface;
  };
  implementations: {
    [interfaceName: string]: InterfaceImplementation[];
  };
}


export function satisfiesConstraint(scope: TypeScope, type: TypeUnit, constraint: TypeUnit, typeConstraints: TypeConstraints, constraintConstraints: TypeConstraints): boolean {
  switch (constraint.kind) {
    case 'TypeStar':
      return true;

    case 'TypeLiteral':
      switch (type.kind) {
        case 'TypeStar':
        case 'TypeVariable':
          return true;

        case 'TypeLiteral':
        case 'TypeApplication':
          // Check if there is an implementation of an interface by that name
          return constraint.name in scope.implementations
            && scope.implementations[constraint.name].some(implementation => (
              isSubtypeUnit(scope, implementation.type, type, implementation.constraints, typeConstraints)
            ));

        default:
          return assertNever(type);
      }

    case 'TypeApplication':
      if (constraint.callee.kind !== 'TypeLiteral') {
        // None of the other options make sense in this case
        return false;
      }

      // Check if there is an implementation of an interface by that name
      return constraint.callee.name in scope.implementations
        && scope.implementations[constraint.callee.name].some(implementation => (
          isSubtypeUnit(scope, type, implementation.type, typeConstraints, implementation.constraints)
            && implementation.parameters.length === constraint.parameters.length
            && implementation.parameters.every((parameter, index) => (
              isSubtypeUnit(scope, parameter, constraint.parameters[index], implementation.constraints, constraintConstraints)
            ))
        ));

    case 'TypeVariable':
      // Check if the type satisfies all of the constraints of the constraint
      return Object.keys(constraintConstraints).every((name) => (
        name !== constraint.name
          || satisfiesConstraint(scope, type, constraintConstraints[name], typeConstraints, constraintConstraints)
      ));

    default:
      return assertNever(constraint);
  }
}

export function isSubtypeUnit(scope: TypeScope, type: TypeUnit, subtype: TypeUnit, typeConstraints: TypeConstraints, subtypeConstraints: TypeConstraints): boolean {
  switch (type.kind) {
    case 'TypeStar':
      return true;

    case 'TypeLiteral':
      return subtype.kind === 'TypeLiteral' && type.name === subtype.name;

    case 'TypeApplication':
      return subtype.kind === 'TypeApplication'
        && type.parameters.length === subtype.parameters.length
        && isSubtypeUnit(scope, type.callee, subtype.callee, typeConstraints, subtypeConstraints)
        && type.parameters.every((leftParameter, index) => (
          isSubtypeUnit(scope, leftParameter, subtype.parameters[index], typeConstraints, subtypeConstraints)
        ));

    case 'TypeVariable':
      // Check if the subtype satisfies all of the constraints of the type
      return Object.keys(typeConstraints).every(name => (
        name !== type.name || satisfiesConstraint(scope, subtype, typeConstraints[name], subtypeConstraints, typeConstraints)
      ));

    default:
      return assertNever(type);
  }
}

export function isSubtype(scope: TypeScope, left: Type, right: Type) {
  return isSubtypeUnit(scope, left.realType, right.realType, left.constraints, right.constraints)
}



