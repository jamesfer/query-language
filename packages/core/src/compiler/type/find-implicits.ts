import { TypeScope } from '../scope';
import { pMap } from '../utils';
import { isSubtype } from './is-subtype';
import { State, StateResult } from './state';
import { Type, TypeConstraint } from './type';

async function findImplementation(
  scope: TypeScope,
  constraint: TypeConstraint,
): Promise<StateResult<string | undefined>> {
  const state = State.of(scope);

  if (scope.implementations) {
    for (const key in scope.implementations) {
      const implementation = scope.implementations[key];
      if (
        await isSubtype(constraint.child, implementation.childType)
          && await isSubtype(constraint.parent, implementation.parentType)
      ) {
        return state.wrap(key);
      }
    }
  }

  if (scope.parent) {
    return findImplementation(scope.parent, constraint);
  }

  return state.wrap(undefined);
}

/**
 * Finds any implicit parameters that have been entirely fulfilled by the given substitutions and
 * attempts to find implementations of them in the scope. If a implicit parameter is entirely
 * specified but it doesn't exist, an error message will be added to the result.
 */
export async function findImplicits(
  scope: TypeScope,
  type: Type,
): Promise<StateResult<(string | undefined)[]>> {
  const state = State.of(scope);
  const implementations = await pMap(type.constraints, state.runAsyncP1(findImplementation));
  return state.wrap(implementations);
}
