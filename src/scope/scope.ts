import { Type } from '../type.model';
import { TypedScope } from '../type-expression/typed-scope.model';
import { mapValues } from 'lodash';
import {
  FunctionValue,
  PlainFunctionValue,
  ValueFunction,
} from '../value.model';
import { EvaluationScope } from '../evaluate-expression/evaluation-scope';

export interface ScopeEntry {
  type: Type,
  value: ValueFunction,
}

export interface Scope {
  [k: string]: ScopeEntry,
}

// TODO Get rid of this
export function makeLibraryFunction(type: Type, value: PlainFunctionValue): ScopeEntry {
  let entry: FunctionValue = {
    kind: 'Function',
    value,
  };
  return {
    type,
    value: () => entry,
  };
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
