import { Type } from './type/type';
import { LazyValue, } from './value';

export interface ScopeEntry {
  type: Type,
  value: LazyValue,
}

export interface Scope {
  [k: string]: ScopeEntry,
}

export function findScopeEntry(scope: Scope, key: string): ScopeEntry | null {
  return scope[key] || null;
}

export function findScopeType(scope: Scope, key: string): Type | null {
  const entry = findScopeEntry(scope, key);
  return entry ? entry.type : null;
}

export function findScopeValue(scope: Scope, key: string): LazyValue | null {
  const entry = findScopeEntry(scope, key);
  return entry ? entry.value : null;
}

// export function addScopeEntries(scope: Scope, ...entries: ScopeEntry[]): Scope {
//   return Object.assign({}, scope, ...entries);
// }
