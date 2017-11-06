import { mapValues } from 'lodash';
import { TypedScope } from '../compile/type/typed-scope.model';
import { EvaluationScope } from '../evaluate/evaluation-scope';
import { Type } from '../type.model';
import { LazyValue, } from '../value.model';

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
