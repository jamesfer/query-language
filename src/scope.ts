import { Type } from './type/type';
import { LazyValue, } from './value';

export interface ScopeVariable {
  type: Type,
  value: LazyValue,
}

export interface Scope {
  /**
   * List of all available variables. Each variable must have a real value
   * such as a number, string or function.
   */
  variables: {
    [k: string]: ScopeVariable,
  },
  /**
   * List of all available types. Each type refers to something that is entirely
   * static in the program.
   */
  types: {
    [k: string]: Type,
  },
}

export function findScopeVariableEntry(scope: Scope, name: string): ScopeVariable | null {
  return scope.variables[name] || null;
}

export function findScopeVariableType(scope: Scope, name: string): Type | null {
  const entry = findScopeVariableEntry(scope, name);
  return entry ? entry.type : null;
}

export function findScopeVariableValue(scope: Scope, name: string): LazyValue | null {
  const entry = findScopeVariableEntry(scope, name);
  return entry ? entry.value : null;
}

export function findScopeType(scope: Scope, name: string): Type | null {
  return scope.types[name] || null;
}
