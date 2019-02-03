import { assertNever } from '../utils';

export interface TypeStar {
  kind: 'TypeStar';
}

export interface TypeLiteral {
  kind: 'TypeLiteral';
  name: string;
}

export interface TypeInterface {
  kind: 'TypeInterface';
  name: string;
}

export interface TypeVariable {
  kind: 'TypeVariable';
  name: string;
}

export interface TypeFunction {
  kind: 'TypeFunction';
  parameterNames: string[];
  body: TypeValue;
}

export interface TypeApplication {
  kind: 'TypeApplication';
  callee: TypeValue;
  parameters: TypeValue[];
}


export type TypeValue =
  | TypeStar
  | TypeVariable
  | TypeLiteral
  | TypeInterface
  | TypeFunction
  | TypeApplication;

export interface TypeConstraint {
  kind: 'TypeConstraint';
  child: TypeValue;
  parents: TypeValue[];
}

export type TypeConstraints = TypeConstraint[];

export interface Type {
  kind: 'Type';
  value: TypeValue;
  constraints: TypeConstraints;
}

export interface SubtypeRelationship {
  kind: 'SubtypeRelationship';
  parent: TypeVariable;
  child: TypeVariable;
}

export interface TypeImplementation {
  kind: 'TypeImplementation';
  parentType: TypeValue;
  childType: TypeValue;
  constraints: TypeConstraints
}

export interface TypeScope {
  // List of implementations of an interface type
  implementations: TypeImplementation[];

  // List of subtype relationships between types
  subtypeRelationships: SubtypeRelationship[];

  // Map of all type declarations
  // This is used to look up the value of an identifier
  declarations: { [k: string]: TypeDeclaration };
}

export interface TypeApplicationExpression {
  kind: 'TypeApplication';
  callee: TypeExpression;
  parameters: TypeExpression[];
}

export interface TypeIdentifierExpression {
  kind: 'TypeIdentifier';
  name: string;
}

export type TypeExpression =
  | TypeStar
  | TypeApplicationExpression
  | TypeIdentifierExpression;

export interface TypeLiteralDeclaration {
  kind: 'TypeLiteralDeclaration';
  name: string;
  parameterNames: string;
}

export interface TypeFunctionDeclaration {
  kind: 'TypeFunctionDeclaration';
  name: string;
  parameterNames: string;
  body: TypeExpression;
}

export type TypeDeclaration =
  | TypeLiteralDeclaration
  | TypeFunctionDeclaration;

export function lookUpDeclaration(
  scope: TypeScope,
  variable: TypeIdentifierExpression,
): TypeDeclaration | undefined {
  return scope.declarations[variable.name];
}




function equal(left: any, right: any) {
  return left === right;
}

function arraysAreEqual<T>(
  left: T[],
  right: T[],
  comparator: (left: T, right: T) => boolean = equal,
): boolean {
  return left.length === right.length
    && left.every((item, index) => comparator(item, right[index]));
}





function substituteVariable(
  type: TypeValue,
  name: string,
  value: TypeValue,
): TypeValue {
  switch (type.kind) {
    case 'TypeStar':
    case 'TypeLiteral':
    case 'TypeInterface':
      return type;

    case 'TypeVariable':
      return type.name === name ? value : type;

    case 'TypeFunction':
      return type.parameterNames.includes(name) ? type : {
        kind: 'TypeFunction',
        parameterNames: type.parameterNames,
        body: substituteVariable(type.body, name, value),
      };

    case 'TypeApplication':
      return {
        kind: 'TypeApplication',
        callee: substituteVariable(type.callee, name, value),
        parameters: type.parameters.map(parameter => substituteVariable(parameter, name, value)),
      };

    default:
      return assertNever(type);
  }
}

function typeValuesAreEqual(left: TypeValue, right: TypeValue): boolean {
  switch (left.kind) {
    case 'TypeStar':
      return right.kind === 'TypeStar';

    case 'TypeVariable':
    case 'TypeLiteral':
    case 'TypeInterface':
      return right.kind === left.kind
        && right.name === left.name;

    case 'TypeFunction':
      return right.kind === 'TypeFunction'
        && arraysAreEqual(right.parameterNames, left.parameterNames)
        && typeValuesAreEqual(left.body, right.body);

    case 'TypeApplication':
      return right.kind === 'TypeApplication'
        && right.parameters.length === left.parameters.length
        && typeValuesAreEqual(left.callee, right.callee)
        && right.parameters.every((parameter, index) => (
          typeValuesAreEqual(parameter, left.parameters[index])
        ));

    default:
      return assertNever(left);
  }
}

function satisfiesConstraint(
  scope: TypeScope,
  constraint: TypeConstraint,
  type: TypeValue,
): boolean {
  if (!typeValuesAreEqual(constraint.child, type)) {
    return true;
  }

  return constraint.parents.every((parent) => {
    switch (parent.kind) {
      case 'TypeStar':
        return true;

      case 'TypeVariable':
        // TODO is this really the correct response
        return true;

      case 'TypeLiteral':
        // Find a subtype relationship defined for this literal
        return scope.subtypeRelationships.some((relationship) => (
          typeValuesAreEqual(relationship.child, type)
          && typeValuesAreEqual(relationship.parent, parent)
        ));

      case 'TypeInterface':
        // Find a subtype relationship defined for this literal
        return scope.implementations.some((implementation) => (
          typeValuesAreEqual(implementation.childType, type)
          && typeValuesAreEqual(implementation.parentType, parent)
          && implementation.constraints.every(constraint => (
            satisfiesConstraint(scope, constraint, type)
          ))
        ));

      case 'TypeApplication':
        // TODO this should look for a subtype relationship or implementation in the scope just like it does for literals and interfaces
        return false;

      case 'TypeFunction':
        // TODO this should check that the child is also a function
        return false;

      default:
        return assertNever(parent);
    }
  });
}

export function isSubtypeUnit(
  scope: TypeScope,
  type: TypeValue,
  subtype: TypeValue,
  typeConstraints: TypeConstraints,
  subtypeConstraints: TypeConstraints,
): boolean {
  switch (type.kind) {
    case 'TypeStar':
      return true;

    case 'TypeLiteral':
    case 'TypeInterface':
      return subtype.kind === type.kind
        && subtype.name === type.name;

    case 'TypeApplication':
      return subtype.kind === 'TypeApplication'
        && subtype.parameters.length === type.parameters.length
        && subtype.parameters.every((subtypeParameter, index) => isSubtypeUnit(
          scope,
          type.parameters[index],
          subtypeParameter,
          typeConstraints,
          subtypeConstraints,
        ));

    case 'TypeFunction':
      return subtype.kind === 'TypeFunction'
        && arraysAreEqual(subtype.parameterNames, type.parameterNames);

    case 'TypeVariable':
      return typeConstraints.every(constraint => (
        satisfiesConstraint(scope, constraint, subtype)
      ));

    default:
      return assertNever(type);
  }
}

export function isSubtype(scope: TypeScope, type: Type, subtype: Type): boolean {
  return isSubtypeUnit(scope, type.value, subtype.value, type.constraints, subtype.constraints);
}

export function evaluateTypeExpression(scope: TypeScope, expression: TypeExpression): TypeValue {
  switch (expression.kind) {
    case 'TypeStar':
      return expression;

    case 'TypeIdentifier':
      const value = lookUpDeclaration(scope, expression);
      // If the identifier matches something in the scope, then return the literal, otherwise return
      // an unbound variable
      return value ? {
        kind: 'TypeLiteral',
        name: value.name,
      } : {
        kind: 'TypeVariable',
        name: expression.name,
      };

    case 'TypeApplication':
      const callee = evaluateTypeExpression(scope, expression.callee);
      switch (callee.kind) {
        case 'TypeStar':
          return callee;

        case 'TypeLiteral':
        case 'TypeVariable':
        case 'TypeInterface':
          return {
            callee,
            kind: 'TypeApplication',
            parameters: expression.parameters.map(parameter => (
              evaluateTypeExpression(scope, parameter)
            )),
          };

        case 'TypeFunction':
          return expression.parameters
            .map(parameter => evaluateTypeExpression(scope, parameter))
            .reduce(
              (body, parameter, index) => (
                substituteVariable(body, callee.parameterNames[index], parameter)
              ),
              callee.body,
            );

        case 'TypeApplication':
          switch (callee.callee.kind) {
            case 'TypeStar':
              return callee.callee;

            case 'TypeLiteral':
            case 'TypeVariable':
            case 'TypeInterface':
              return {
                callee: callee.callee,
                kind: 'TypeApplication',
                parameters: [
                  ...callee.parameters,
                  ...expression.parameters.map(parameter => (
                    evaluateTypeExpression(scope, parameter)
                  )),
                ],
              };

            case 'TypeFunction':
            case 'TypeApplication':
              throw new Error('Multilevel type application was not resolved when evaluating a type');

            default:
              return assertNever(callee.callee);
          }

        default:
          return assertNever(callee);
      }

    default:
      return assertNever(expression);
  }
}


//
// function substituteTypeVariable(type: TypeValue, variable: TypeVariable, value: TypeValue): TypeValue {
//   switch (type.kind) {
//     case 'TypeStar':
//     case 'TypeLiteral':
//     case 'TypeInterface':
//       return type;
//
//     case 'TypeVariable':
//       return type.name === variable.name ? value : type;
//
//     case 'TypeApplication':
//       return {
//         kind: 'TypeApplication',
//         callee: substituteTypeVariable(type.callee, variable, value),
//         parameters: type.parameters.map(parameter => (
//           substituteTypeVariable(parameter, variable, value)
//         )),
//       };
//
//     case 'TypeFunction':
//       return type.parameterNames.includes(variable.name) ? type : {
//         kind: 'TypeFunction',
//         parameterNames: type.parameterNames,
//         body: substituteTypeVariable(type.body, variable, value),
//       };
//
//     default:
//       return assertNever(type);
//   }
// }


/**
 * Compares two types and returns the highest common type between them. It is used when an argument
 * is passed to a function to produce the new signature.
 */
// export function convergeTypeValues(
//   scope: TypeScope,
//   left: TypeValue,
//   leftConstraints: TypeConstraints,
//   right: TypeValue,
//   rightConstraints: TypeConstraints,
// ): [TypeValue, TypeConstraints] {
//   if (right.kind === 'TypeStar' && left.kind !== 'TypeStar') {
//     return convergeTypeValues(scope, right, rightConstraints, left, leftConstraints);
//   }
//
//   if (right.kind === 'TypeVariable' && left.kind !== 'TypeVariable' && left.kind !== 'TypeStar') {
//     return convergeTypeValues(scope, right, rightConstraints, left, leftConstraints);
//   }
//
//   switch (left.kind) {
//     case 'TypeStar':
//       return [right, rightConstraints];
//
//     case 'TypeVariable':
//       if (right.kind !== 'TypeVariable') {
//         return [right, rightConstraints];
//       }
//
//       return [right, [
//         ...rightConstraints,
//         ...leftConstraints.map(constraint => ({
//           kind: 'TypeConstraint',
//           child: substituteTypeVariable(constraint.child, left, right),
//           parents: constraint.parents.map(parent => substituteTypeVariable(parent, left, right)),
//         })),
//       ]];
//   }
// }
