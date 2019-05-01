import { evaluateSyntaxTree } from 'compiler/evaluate-expression';
import { assertNever } from '../utils';
import { Expression } from './expression';
import {
  SubtypeRelationship,
  Type,
  TypeConstraint,
  TypeDeclaration,
  TypeImplementation,
} from './type';
import { Value } from './value';
import { lambda, userDefinedLiteral } from './value-constructors';

/**
 * Used when programmatically defining a library
 */
// export interface Prescope {
//   /**
//    * List of declared variables. This is where all functions and constants are defined.
//    * TODO this shouldn't be a normal expression as it doesn't have a source position
//    */
//   variables?: { [k: string]: Expression };
//
//   /**
//    * Map of all type declarations. This is where all type functions and type literals are defined.
//    * For now, this is kept separate from the value declarations.
//    * TODO this shouldn't be a normal type declaration as it doesn't have a source position
//    */
//   declarations?: { [k: string]: TypeDeclaration };
//
//   /**
//    * List of implementations of an interface type.
//    * TODO this shouldn't be a normal implementation as it doesn't have a source position
//    */
//   implementations?: TypeImplementation[];
//
//   /**
//    * List of subtype relationships between types.
//    * TODO this shouldn't be a normal subtype as it doesn't have a source position
//    */
//   subtypeRelationships?: SubtypeRelationship[];
// }


export interface Scope {
  /**
   * Parent of this scope.
   */
  parent?: Scope | null;

  /**
   * List of declared variables. This is where all functions and constants are defined.
   * TODO each declaration should include the source location of where it was declared
   */
  variables?: { [k: string]: Expression };

  /**
   * Map of all type declarations. This is where all type functions and type literals are defined.
   * For now, this is kept separate from the value declarations.
   */
  declarations?: { [k: string]: TypeDeclaration };

  /**
   * List of implementations of an interface type.
   */
  // TODO these need to be named
  implementations?: TypeImplementation[];

  /**
   * List of subtype relationships between types.
   */
  subtypeRelationships?: SubtypeRelationship[];
}

export function resolveVariable(scope: Scope, name: string): Expression | null {
  return scope.variables && scope.variables[name] ? scope.variables[name]
    : scope.parent ? resolveVariable(scope.parent, name) : null;
}

export function resolveVariableType(scope: Scope, name: string): Value | null {
  const variable = resolveVariable(scope, name);
  return variable ? variable.resultType : null;
}

export function resolveTypeVariable(scope: Scope, name: string): Value | null {
  if (!(scope.declarations && scope.declarations[name])) {
    return scope.parent ? resolveTypeVariable(scope.parent, name) : null;
  }

  const declaration = scope.declarations[name];
  switch (declaration.kind) {
    case 'UserDefinedLiteralDeclaration':
      return userDefinedLiteral(declaration.name);

    case 'LambdaDeclaration':
      // TODO correctly evaluate the lambda body
      // TODO if the lambda is recursive, this might blow the stack
      return lambda(declaration.parameterNames, async () => evaluateSyntaxTree(scope, declaration.body));

    default:
      return assertNever(declaration);
  }
}

// TODO the child's parent is overridden by this function. Think of a better way to expand the scope
export function expandScope(scope: Scope, child: Scope): Scope {
  return { ...child, parent: scope }
}

export interface TypeScope {
  /**
   * Parent of this scope.
   */
  parent?: TypeScope | null;

  /**
   * List of the types of declared variables.
   */
  variables?: { [k: string]: Type };

  /**
   * List of implementations of an interface type.
   */
  implementations?: TypeImplementation[];

  /**
   * List of subtype relationships between types.
   */
  subtypeRelationships?: SubtypeRelationship[];
}

export function heightOfScope(scope: TypeScope): number {
  let parent = scope.parent;
  let height = 0;
  while (parent) {
    height += 1;
    parent = parent.parent;
  }
  return height;
}

export function trimChildrenOfScope(scope: TypeScope, number: number): TypeScope {
  let result: TypeScope = scope;
  for (let i = 0; i < number && scope.parent; i++) {
    result = scope.parent;
  }
  return result;
}

export function overwriteScope(currentScope: TypeScope, newScope: TypeScope): TypeScope {
  return trimChildrenOfScope(newScope, heightOfScope(newScope) - heightOfScope(currentScope));
}

export function appendScope(
  scope: TypeScope,
  variables: { [k: string]: Type } = {},
  implementations: TypeImplementation[] = [],
  subtypeRelationships: SubtypeRelationship[] = [],
): TypeScope {
  return {
    parent: scope.parent,
    variables: {
      ...scope.variables,
      ...variables,
    },
    implementations: {
      ...scope.implementations,
      ...implementations,
    },
    subtypeRelationships: {
      ...scope.subtypeRelationships,
      ...subtypeRelationships,
    },
  };
}

export function assignVariableType(scope: TypeScope, name: string, type: Type) {
  return appendScope(scope, { [name]: type });
}

export function createChildScope(
  scope: TypeScope,
  variables: { [k: string]: Type } = {},
  implementations: TypeImplementation[] = [],
  subtypeRelationships: SubtypeRelationship[] = [],
): TypeScope {
  return {
    variables,
    implementations,
    subtypeRelationships,
    parent: scope,
  };
}

export function findVariableInTypeScope(scope: TypeScope, name: string): Type | undefined {
  return scope.variables ? scope.variables[name] : undefined;
}

export function findImplementationInTypeScope(scope: TypeScope, name: string, argType: Value[]): string {

}

export interface InferredTypesScope {
  /**
   * Contains a map type variable names and their inferred types from the context they are used in.
   * This is used when attempting to infer the type of function expression arguments.
   */
  inferredVariableTypes: { [k: string]: Value };

  /**
   * Contains a list of interface restrictions that are required to be fulfilled by the nearest
   * enclosing function scope. This is used when defining a function literal or calling a new
   * function so that the implicit parameters can be determined, or passed on to a higher scope.
   */
  implicitInterfaceParameters: { [k: string]: TypeConstraint };
}

export function emptyInferredTypesScope(): InferredTypesScope {
  return { inferredVariableTypes: {}, implicitInterfaceParameters: {} };
}

export function expandInferredTypesScope(left: InferredTypesScope, right: InferredTypesScope): InferredTypesScope {
  return {
    inferredVariableTypes: { ...left.inferredVariableTypes, ...right.inferredVariableTypes },
    implicitInterfaceParameters: { ...left.implicitInterfaceParameters, ...right.implicitInterfaceParameters },
  };
}

export function clearImplicitInterfaces(scope: InferredTypesScope): InferredTypesScope {
  return {
    inferredVariableTypes: scope.inferredVariableTypes,
    implicitInterfaceParameters: {},
  };
}

export function findInferredVariableType(scope: InferredTypesScope, name: string): Value | undefined {
  return scope.inferredVariableTypes[name];
}
