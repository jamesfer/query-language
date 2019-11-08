import { TypeScope } from '../scope';
import { LazyValue } from '../value';
import { convergeTypes } from './converge-types';
import { State, StateResult } from './state';
import {
  applyAllSubstitutions,
  applySubstitutionsToSubstitutions,
  VariableSubstitution,
} from './variable-substitutions';

type Result = { left: VariableSubstitution[], right: VariableSubstitution[], inferred: VariableSubstitution[] };

type ConvergeResult = Promise<StateResult<Result>>;

type PartialConverge = (
  scope: TypeScope,
  previousLeft: VariableSubstitution[],
  previousRight: VariableSubstitution[],
  previousInferred: VariableSubstitution[],
) => ConvergeResult;

export function fullConverge(leftValue: LazyValue, rightValue: LazyValue): PartialConverge {
  return async (
    scope: TypeScope,
    previousLeft: VariableSubstitution[],
    previousRight: VariableSubstitution[],
    previousInferences: VariableSubstitution[],
  ): ConvergeResult => {
    const state = State.of(scope);

    const newLeft = applyAllSubstitutions(previousLeft, previousInferences, leftValue);
    const newRight = applyAllSubstitutions(previousRight, previousInferences, rightValue);
    const [{ left, right, inferred }] = await state.runAsync(convergeTypes, newLeft, newRight);

    // TODO check if left and right had different replacements for the same value and throw an error

    // TODO We might not need to do this if we restructured substitutions to be a dictionary where
    //      from is the key
    return state.wrap({
      left: [...previousLeft, ...right, ...left],
      right: [...previousRight, ...right, ...left],
      inferred: [
        ...applySubstitutionsToSubstitutions([left, right], previousInferences),
        ...inferred,
      ],
    });
  };
}

export async function sequenceConverges(scope: TypeScope, converges: PartialConverge[]): ConvergeResult {
  const state = State.of(scope);
  if (converges.length === 0) {
    return state.wrap({ left: [], right: [], inferred: [] });
  }

  const [top, ...rest] = converges;
  const { left, right, inferred } = await state.runAsync(sequenceConverges, rest);
  return state.wrap(await state.runAsync(top, left, right, inferred));
}
