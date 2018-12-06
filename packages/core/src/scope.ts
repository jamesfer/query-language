import { Type } from './type/type';
import { LazyValue } from './value';
import { Expression } from './expression';
import { evaluateExpression } from './compiler/evaluate-expression';
import { Dictionary } from 'lodash';

export interface TypeScope {
  // The parent scope of this one
  parent: TypeScope | null;
  // A dictionary of identifiers and their types
  types: {
    [k: string]: Type;
  }
}

/**
 * Finds the given identifier in the scope or returns null if it can't be found.
 */
export function findTypeInScope(scope: TypeScope, identifier: string): Type | null {
  if (scope.types[identifier]) {
    return scope.types[identifier];
  }
  return !scope.parent ? null : findTypeInScope(scope.parent, identifier);
}

/**
 * Creates a new scope with the given scope as it's parent. Effectively expands the current scope
 * with new variables.
 */
export function expandTypeScope(scope: TypeScope, types: { [k: string]: Type }): TypeScope {
  return { types, parent: scope };
}

// TODO not sure if this is needed anymore now that we have the global generic type scope
export function inferTypeScope(scope: TypeScope, inferredScope: TypeScope) {
  return {
    parent: scope.parent,
    types: {
      ...scope.types,
      ...inferredScope.types,
    },
  };
}

export interface TypeVariableScope {
  // A map of type variable's unique identifiers to their inferred type
  variables: { [k: number]: Type }
}

/**
 * Creates a new, empty type variable scope.
 */
export function emptyTypeVariableScope(): TypeVariableScope {
  return { variables: {} };
}

/**
 * Finds the given type identifier in the type variable scope and returns it, or null if it couldn't
 * be found.
 */
export function findTypeVariableInScope(scope: TypeVariableScope, type: number): Type | null {
  return scope.variables[type] || null;
}

/**
 * Merges the existing type variable scope with new values.
 */
export function mergeTypeVariableScopes(
  existingScope: TypeVariableScope,
  newScope: TypeVariableScope,
): TypeVariableScope {
  return {
    variables: {
      ...existingScope.variables,
      ...newScope.variables,
    },
  };
}

/**
 * Overwrites an existing scope with new values. This modifies the existing scope.
 */
export function overwriteTypeVariableScope(
  existingScope: TypeVariableScope,
  newScope: TypeVariableScope,
) {
  Object.assign(existingScope.variables, newScope.variables);
}

/**
 * Updates a single type variable in the scope.
 * @param existingScope
 * @param identifier
 * @param type
 */
export function assignTypeVariableInScope(
  existingScope: TypeVariableScope,
  identifier: number,
  type: Type,
): TypeVariableScope {
  return mergeTypeVariableScopes(existingScope, { variables: { [identifier]: type }});
}



/**
 * Full scope of the entire language. Everything that can be referenced by a
 * name is stored in the scope. Each key is an identifier in the language and
 * the entry can be a variable, function or interface.
 */
export interface Scope {
  /**
   * List of all available variables. Each variable must have a real value
   * such as a number, string or function.
   */
  variables: {
    [k: string]: Expression,
  };
  /**
   * List of all available types. Each type refers to something that is entirely
   * static in the program.
   */
  types: {
    [k: string]: Type,
  };
}

export function findScopeVariableEntry(scope: Scope, name: string): Expression | null {
  const variable = scope.variables[name];
  if (variable) {
    return variable;
  }

  for (const typeName in scope.types) {
    const type = scope.types[typeName];
    if (type.kind === 'Interface') {
      for (const methodName in type.methods) {
        if (methodName === name) {
          return type.methods[methodName];
        }
      }
    }
  }
  return null;
}

export function findScopeVariableType(scope: Scope, name: string): Type | null {
  const entry = findScopeVariableEntry(scope, name);
  return entry ? entry.resultType : null;
}

export function findScopeType(scope: Scope, name: string): Type | null {
  return scope.types[name] || null;
}

export function expandScope(scope: Scope, scopePartial: Partial<Scope>): Scope {
  return {
    variables: scopePartial.variables ? { ...scope.variables, ...scopePartial.variables }
      : scope.variables,
    types: scopePartial.types ? { ...scope.types, ...scopePartial.types } : scope.types,
  };
}

// TODO implement
export function restrictScope(scope: Scope, limitingScope: Scope): Scope {
  return {
    variables: scope.variables,
    types: scope.types,
  };
}
