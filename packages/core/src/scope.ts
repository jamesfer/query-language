import { Type } from './type/type';
import { LazyValue } from './value';
import { Expression } from './expression';
import { evaluateExpression } from './compiler/evaluate-expression';

// export interface ScopeVariable {
//   type: Type,
//   value: LazyValue,
// }

/**
 * Full scope of the entire language. Everything that can be referenced by a
 * name is stored in the scope. Each key is an identifier in the language and
 * the entry can be a variable, function or interface.
 */
export interface Scope {
  /**
   * List of all pre evaluated values. Only used when calling function expressions. Hopefully should
   * be removed one day.
   */
  values: {
    [k: string]: LazyValue,
  };

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

export function findScopeVariableValue(scope: Scope, name: string): LazyValue | null {
  const value = scope.values[name];
  if (value) {
    return value;
  }

  const entry = findScopeVariableEntry(scope, name);
  if (entry) {
    return evaluateExpression(scope, entry) || null;
  }
  return null;
}

export function findScopeType(scope: Scope, name: string): Type | null {
  return scope.types[name] || null;
}
