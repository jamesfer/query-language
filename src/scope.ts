import { mapValues } from 'lodash';
import { Type } from './type';
import { LazyValue, } from './value';
import { TypedScope } from './compiler/typed-scope.model';
import { EvaluationScope } from './compiler/evaluation-scope';

export interface ScopeEntry {
  type: Type,
  value: LazyValue,
}

export interface Scope {
  [k: string]: ScopeEntry,
}

export function extractTypedScope(scope: Scope): TypedScope {
  return mapValues(scope, val => val.type);
}

export function extractEvaluationScope(scope: Scope): EvaluationScope {
  return mapValues(scope, val => val.value);
}

export function addScopeEntries(scope: Scope, ...entries: ScopeEntry[]): Scope {
  return Object.assign({}, scope, ...entries);
}
