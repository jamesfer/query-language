/**
 * Every variable has a Type.
 * Each type is made up of a DataType and a list of constraints.
 * A DataType is simply a name with a list of parameters applied to it.
 * A TypeVariable is a name for a type.
 * TypeVariables can have a higher level of constraints on them that limits the types that can
 * fulfill that variable.
 *
 * Example 1:
 * // Declares a new type (Ordering) that has 3 literal values. Each literal value takes 0
 * // parameters.
 * type Ordering: LessThan | EqualTo | GreaterThan
 *
 * Example 2:
 * // Specifies that A could satisfy the Equal interface, if it provides the following methods.
 * // Here Equal is a kind that takes zero parameters and A is a type.
 * interface Equal >> A:
 *   =: (A, A) -> Bool
 * // Declares a new type (Measurement) that takes 2 parameters and has one literal representation.
 * // Value and Unit are type variables that can be used in the declared literals.
 * type Measurement<Value, Unit>: Measurement(Value, Unit)
 * // Specifies that Measurement<V, U> implements the Equal interface when both V and U implement it
 * // as well. We must provide the parameters to Measurement because the A in equal Equal does not
 * // take any parameters.
 * implement Measurement<V, U> << Equal when V << Equal, U << Equal:
 *   =: (Measurement(valueA, unitA), Measurement(valueB, unitB)) -> valueA = valueB and unitA = unitB
 *
 * Example 3:
 * // Specifies that M could satisfy the Monad interface. Here Monad is a kind that takes
 * // one parameter. The constraint on M specifies that it should take one parameter. The *
 * // represents any type whatsoever
 * interface Monad >> M when M << * -> *:
 *   bind: (M<A>, A -> M<B>) -> M<B>
 * // Create the Maybe type that takes one parameter. Here, there are two literal representations
 * // of the Maybe type.
 * type Maybe<A>: Just(A) | Nothing
 * // Implement the Monad interface for the Maybe type. We cannot specify the parameter to Maybe
 * // in the implement line because the M parameter of Monad is required to accept a parameter.
 * implement Maybe << Monad:
 *   bind: (Just(a), f) -> Just(f(a))
 *   bind: (Nothing, _) -> Nothing
 *
 * // A function that takes a single parameter. It as two type variables, M and A, and one
 * // restriction that states that M must be a type function.
 * combineM: List<M<A>> -> M<List<A>> when M << Monad
 *
 * interface ConvertibleFrom<A> -> B:
 *   convertTo: (A) -> B
 * convert: A -> B when B = ConvertibleFrom<A>
 */
import { assertNever } from '../utils';
import { keyBy } from 'lodash';

/**
 * Abstract syntax tree nodes for types
 */

export interface TypeStar {
  kind: 'TypeStar';
}

export interface TypeIdentifier {
  kind: 'TypeVariable';
  name: string;
}

export interface TypeApplication {
  kind: 'TypeApplication';
  callee: TypeUnit;
  parameters: TypeUnit[];
}

export type TypeUnit =
  | TypeIdentifier
  | TypeApplication
  | TypeStar;

export interface TypeConstraint {
  kind: 'TypeConstraint';
  child: TypeUnit;
  parents: TypeUnit[];
}

export type TypeConstraints = TypeConstraint[];

export interface TypeExpression {
  kind: 'TypeExpression';
  typeUnit: TypeUnit;
  constraints: TypeConstraints;
}


/**
 * Type value
 */

export interface TypeLiteral {
  kind: 'TypeLiteral';
  name: string;
  parameters: TypeValue[];
}

// TODO soon
// export interface TypeFunctionCall {
//   kind: 'TypeFunctionCall';
//   callee:
//   parameters: TypeValue[];
// }

export type TypeValue =
  | TypeStar
  | TypeLiteral;


/**
 * Declarations parts
 */

export interface TypeImplementation {
  kind: 'TypeImplementation';
  parentType: TypeUnit;
  childType: TypeUnit;
  constraints: TypeConstraints
}

export interface TypeLiteralDeclaration {
  kind: 'TypeLiteralDeclaration';
  name: string;
  parameters: TypeUnit[];
  constraints: TypeConstraints;
}

// TODO, Eventually interfaces should be merged with a standard type declarations
export interface InterfaceDeclaration {
  kind: 'InterfaceDeclaration';
  name: string;
  subject: TypeIdentifier;
  parameters: TypeUnit[];
  constraints: TypeConstraints;
}

export type TypeDeclaration =
  | TypeLiteralDeclaration
  | InterfaceDeclaration;

export interface SubtypeRelationship {
  kind: 'SubtypeRelationship';
  parent: TypeIdentifier;
  child: TypeIdentifier;
}

export interface TypeScope {
  kind: 'TypeScope';
  // Any type artifact that has a name (types, type literals, interfaces) will be listed in this
  // section. Later, this will also include functions.
  // TODO include interfaces
  declarations: {
    [name: string]: TypeDeclaration;
  };
  // List of implementations of interfaces
  implementations: TypeImplementation[];
  // List of implementations of types
  subtypes: SubtypeRelationship[];
}


/**
 * Type value
 */




/**
 * Helper functions
 */

const typeStar: TypeStar = { kind: 'TypeStar' };

export function typeVariable(name: string): TypeIdentifier {
  return { name, kind: 'TypeVariable' };
}

// export function typeLiteral(name: string): TypeLiteral {
//   return { name, kind: 'TypeLiteral' };
// }

export function typeApplication(callee: TypeUnit, parameters: TypeUnit[]): TypeApplication {
  return { callee, parameters, kind: 'TypeApplication' };
}

export function typeImplementation(
  parentType: TypeUnit,
  childType: TypeUnit,
  constraints: TypeConstraints,
): TypeImplementation {
  return { parentType, childType, constraints, kind: 'TypeImplementation' };
}

export function typeScope(
  declarations: TypeDeclaration[],
  implementations: TypeImplementation[],
  subtypes: SubtypeRelationship[],
): TypeScope {
  return {
    implementations,
    subtypes,
    kind: 'TypeScope',
    declarations: keyBy(declarations, 'name'),
  };
}

// export function typeValue(declaration: TypeDeclaration, parameters: TypeUnit[]): TypeValue {
//   return {
//     parameters,
//     declaration,
//     kind: 'TypeValue',
//   };
// }

export function typeLiteralsAreEqual(
  a: TypeLiteralDeclaration,
  b: TypeLiteralDeclaration,
): boolean {
  return a.name === b.name;
}


/**
 * Tree iteration helpers
 */

export interface TreeIterationContext<N> {
  index: number,
  depth: number,
  parent: N | null,
  visited: N[],
}

export type TreeIteratee<N, R> = (node: N, context: TreeIterationContext<N>) => R;

export function breadthFirstIterate<N, L>(
  nodes: N[],
  links: L,
  neighboursOf: (node: N, links: L) => N[],
  iterator: TreeIteratee<N, undefined | boolean>,
): void {
  const visited: N[] = [];
  const toVisit: { node: N, depth: number, parent: N | null }[] = nodes.map(node => ({
    node,
    depth: 0,
    parent: null,
  }));
  let index = 0;
  while (toVisit.length > 0) {
    const { node, depth, parent } = toVisit.shift() as { node: N, depth: number, parent: N | null };

    const result = iterator(node, { depth, parent, index, visited });
    if (result === true) {
      break;
    }

    index += 1;
    visited.push(node);
    const nextNodes = neighboursOf(node, links)
      .filter(node => !visited.includes(node))
      .map(neighbour => ({
        node: neighbour,
        depth: depth + 1,
        parent: node,
      }));
    toVisit.push(...nextNodes);
  }
}

export function breadthFirstIncludes<N, L>(
  nodes: N[],
  links: L,
  neighboursOf: (node: N, links: L) => N[],
  iteratee: TreeIteratee<N, boolean>,
) {
  let includes = false;
  breadthFirstIterate(
    nodes,
    links,
    neighboursOf,
    (node, context) => {
      if (iteratee(node, context)) {
        includes = true;
      }
      // Return true to exit early
      return includes;
    },
  );
  return includes;
}

export function getImplementationsOf(
  scope: TypeScope,
  type: TypeUnit,
  constraints: TypeConstraints,
): TypeImplementation[] {
  return scope.implementations.filter(implementation => (
    isSubtypeUnit(
      scope,
      implementation.parentType,
      type,
      implementation.constraints,
      constraints,
    )
  ));
}


/**
 * Type scope
 */

export function lookUpVariableValue(
  scope: TypeScope,
  variable: TypeIdentifier,
): TypeDeclaration | undefined {
  return scope.declarations[variable.name];
}

export function subtypeRelationshipExists(
  scope: TypeScope,
  parent: TypeLiteralDeclaration,
  child: TypeLiteralDeclaration,
): boolean {
  return scope.subtypes.some((relationship) => {
    const relationshipParentValue = lookUpVariableValue(scope, relationship.parent);
    const relationshipChildValue = lookUpVariableValue(scope, relationship.child);
    if (!relationshipParentValue || !relationshipChildValue) {
      throw new Error('Parent or child missing in subtype relationship');
    }

    if (
      relationshipParentValue.kind !== 'TypeLiteralDeclaration'
      || relationshipChildValue.kind !== 'TypeLiteralDeclaration'
    ) {
      throw new Error('Subtype relationship established between two non-literals');
    }

    return typeLiteralsAreEqual(relationshipParentValue, parent)
      && typeLiteralsAreEqual(relationshipChildValue, child)
  });
}


/**
 * Type operations
 */

/**
 * Evaluates an type syntax tree node into an actual type.
 */
function evaluateType(scope: TypeScope, type: TypeUnit): TypeValue {
  switch (type.kind) {
    case 'TypeApplication': {
      if (type.callee.kind === 'TypeStar') {
        throw new Error('The callee of a type application cannot be a type star');
      }

      const calleeDeclaration = resolveType(scope, type.callee);
      return typeValue(calleeDeclaration, )
    }

    case 'TypeVariable':

    default:
      return assertNever(type);
  }
}


/**
 * Is subtype
 */

export function satisfiesConstraint(
  scope: TypeScope,
  type: TypeUnit,
  constraint: TypeUnit,
  typeConstraints: TypeConstraints,
  constraintConstraints: TypeConstraints,
): boolean {
  switch (constraint.kind) {
    case 'TypeStar':
      return true;

    case 'TypeVariable':
      const constraintValue = lookUpVariableValue(scope, constraint);
      if (constraintValue) {
        switch (constraintValue.kind) {
          case 'TypeLiteralDeclaration':
            switch (type.kind) {
              case 'TypeStar':
                return true;

              case 'TypeApplication': {
                const callee = type.callee;
                if (callee.kind !== 'TypeVariable') {
                  throw new Error('The callee of an application cannot be anything but a variable');
                }

                // TODO check if the application is calling a function
                const typeValue = lookUpVariableValue(scope, callee);



                break;
              }

              case 'TypeVariable': {
                const typeValue = lookUpVariableValue(scope, type);
                if (typeValue) {
                  switch (typeValue.kind) {
                    case 'TypeLiteralDeclaration':
                      // Check if there is a subtype relationship between the constraint and the
                      // type
                      return subtypeRelationshipExists(scope, constraintValue, typeValue);

                    case 'InterfaceDeclaration':
                      throw new Error('An interface declaration cannot be on the child part of an interface constraint');

                    default:
                      return assertNever(typeValue);
                  }
                }

                // The type is unbound, it does satisfy the constraint
                return true;
              }

              default:
                return assertNever(type);
            }
        }
      }

      // Check if the type satisfies all of the constraints of the constraint
      return Object.keys(constraintConstraints).every(name => (
        name !== constraint.name || satisfiesAllConstraints(
          scope,
          type,
          constraintConstraints[name],
          typeConstraints,
          constraintConstraints,
        )
      ));

    // case 'TypeLiteral':
    case 'TypeApplication':
      // Implementations of this constraint type
      const constraintImplementations = getImplementationsOf(
        scope,
        constraint,
        constraintConstraints,
      );

      return breadthFirstIncludes(
        constraintImplementations,
        scope,
        ({ childType, constraints }, scope) => getImplementationsOf(scope, childType, constraints),
        ({ childType, constraints }) => (
          isSubtypeUnit(scope, childType, type, constraints, typeConstraints)
        ),
      );

    default:
      return assertNever(constraint);
  }
}

export function satisfiesAllConstraints(
  scope: TypeScope,
  type: TypeUnit,
  constraints: TypeUnit[],
  typeConstraints: TypeConstraints,
  constraintConstraints: TypeConstraints,
): boolean {
  return constraints.every(constraint => (
    satisfiesConstraint(scope, type, constraint, typeConstraints, constraintConstraints)
  ));
}

function isSubtypeOfTypeLiteralDeclaration(scope: TypeScope, declaration: TypeLiteralDeclaration, subtype: TypeUnit, subtypeConstraints: TypeConstraints): boolean {
  if (subtype.kind !== 'TypeVariable') {
    return false;
  }

  const value = lookUpVariableValue(scope, subtype);
  if (!value) {
    return false;
  }

  if (value.kind !== 'TypeLiteralDeclaration') {
    return false;
  }

  return typeLiteralsAreEqual(declaration, value);
}

export function isSubtypeUnit(
  scope: TypeScope,
  type: TypeUnit,
  subtype: TypeUnit,
  typeConstraints: TypeConstraints,
  subtypeConstraints: TypeConstraints,
): boolean {
  switch (type.kind) {
    case 'TypeStar':
      return true;

    case 'TypeApplication':
      // TODO check if the application is a function, or a literal
      // TODO check if the subtype is a function that resolves to something that is a subtype
      return subtype.kind === 'TypeApplication'
        && type.parameters.length === subtype.parameters.length
        && isSubtypeUnit(scope, type.callee, subtype.callee, typeConstraints, subtypeConstraints)
        && type.parameters.every((leftParameter, index) => (
          isSubtypeUnit(scope, leftParameter, subtype.parameters[index], typeConstraints, subtypeConstraints)
        ));

    case 'TypeVariable':
      // Check if the variable is bound to something
      const variableValue = lookUpVariableValue(scope, type);
      if (variableValue) {
        switch (variableValue.kind) {
          case 'TypeLiteralDeclaration':
            return isSubtypeOfTypeLiteralDeclaration(scope, variableValue, subtype, subtypeConstraints);

          case 'InterfaceDeclaration':
            throw new Error('Cannot check if a type variable is the subtype of an interface');

          default:
            return assertNever(variableValue);
        }
      }

      // The type variable is unbound. Therefore, check if the subtype satisfies all of the
      // constraints of the type
      return Object.keys(typeConstraints).every(name => (
        name !== type.name || satisfiesAllConstraints(
          scope,
          subtype,
          typeConstraints[name],
          subtypeConstraints,
          typeConstraints,
        )
      ));

    default:
      return assertNever(type);
  }
}

export function isSubtype(scope: TypeScope, left: TypeExpression, right: TypeExpression) {
  return isSubtypeUnit(scope, left.typeUnit, right.typeUnit, left.constraints, right.constraints);
}


/**
 * Converge Types
 */

// export function convergeTypeUnits(
//   scope: TypeScope,
//   left: TypeUnit,
//   right: TypeUnit,
//   leftConstraints: TypeConstraints,
//   rightConstraints: TypeConstraints,
// ): TypeUnit | null {
//   if (left.kind === 'TypeStar') {
//     return right;
//   }
//   if (right.kind === 'TypeStar') {
//     return left;
//   }
//
//   // It is easier to have the type variable on the left hand side
//   if (left.kind !== 'TypeVariable' && right.kind === 'TypeVariable') {
//     return convergeTypeUnits(scope, right, left, rightConstraints, leftConstraints);
//   }
//
//   switch (left.kind) {
//     case 'TypeLiteral':
//       if (isSubtypeUnit(scope, left, right, leftConstraints, rightConstraints)) {
//         return right;
//       }
//       if (isSubtypeUnit(scope, right, left, rightConstraints, leftConstraints)) {
//         return right;
//       }
//       return null;
//
//     case 'TypeApplication':
//       if (right.kind !== 'TypeApplication' || left.parameters.length !== right.parameters.length) {
//         return null;
//       }
//
//       const callee = convergeTypeUnits(scope, left.callee, right.callee, leftConstraints, rightConstraints);
//       if (!callee) {
//         return null;
//       }
//
//       const parameters: TypeUnit[] = [];
//       for (let i = 0; i < left.parameters.length; i++) {
//         const nextParameter = convergeTypeUnits(
//           scope,
//           left.parameters[i],
//           right.parameters[i],
//           leftConstraints,
//           rightConstraints,
//         );
//         if (!nextParameter) {
//           return null;
//         }
//         parameters.push(nextParameter);
//       }
//
//       return { kind: 'TypeApplication', callee, parameters };
//
//     case 'TypeVariable':
//       if (right.kind === 'TypeVariable') {
//         // TODO merge right constraints into this one
//         return left;
//       }
//
//       // Check if the other type passes all constraints
//
//
//     default:
//       return assertNever(left);
//   }
// }
//
// export function convergeTypes(scope: TypeScope, left: TypeExpression, right: TypeExpression) {
//
// }
