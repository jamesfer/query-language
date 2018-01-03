import { mapValues } from 'lodash';
import { Type } from './type';
import { LazyValue, } from './value';

export interface ScopeEntry {
  type: Type,
  value: LazyValue,
}

export interface Scope {
  [k: string]: ScopeEntry,
}

export interface TypedScope {
  [k: string]: Type;
}

export function extractTypedScope(scope: Scope): TypedScope {
  return mapValues(scope, val => val.type);
}

export type EvaluationScope = {
  [k: string]: LazyValue,
};

export function extractEvaluationScope(scope: Scope): EvaluationScope {
  return mapValues(scope, val => val.value);
}

export function addScopeEntries(scope: Scope, ...entries: ScopeEntry[]): Scope {
  return Object.assign({}, scope, ...entries);
}
