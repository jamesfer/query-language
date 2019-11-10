import { Expression } from '../expression';
import { TypeScope } from '../scope';
import { pMap } from '../utils';
import { findImplicits } from './find-implicits';
import { State, StateResult } from './state';
import { Type, TypeConstraint } from './type';
import { flatMap, compact } from 'lodash';

interface ResolveImplicitsResult {
  missing: TypeConstraint[];
  carried: (string | number)[][];
}

export async function resolveImplicits(
  scope: TypeScope,
  types: Type[],
): Promise<StateResult<ResolveImplicitsResult>> {
  const state = State.of(scope);

  // Check if we can imply any interfaces for each of the elements
  const implicits = await pMap(types, state.runAsyncP1(findImplicits));

  // Collect all the implicits that we couldn't find
  const missing = flatMap(implicits, (implicitList, elementIndex) => (
    compact(implicitList.map((implicitArg, implicitIndex) => (
      implicitArg === undefined
        ? types[elementIndex].constraints[implicitIndex]
        : undefined
    )))
  ));

  // Replace any implicits we couldn't find with the index from the parent
  let index = 0;
  const carried = implicits.map(elementImplicits => elementImplicits.map(implicit => (
    implicit || index++
  )));

  return state.wrap({ missing, carried });
}
