import { TypeScope } from '../scope';
import { LazyValue } from '../value';
import { convergeTypes } from './converge-types';
import { State, StateResult } from './state';
import {
  applyInferredSubstitutions,
  applySubstitutions,
  VariableSubstitution,
} from './variable-substitutions';

type Result = ({ substitutions: VariableSubstitution[], inferred: VariableSubstitution[] });

type P<T> = [
  { left: VariableSubstitution[], inferred: VariableSubstitution[] },
  (nextLeft: VariableSubstitution[], nextInferred: VariableSubstitution[]) => T
];

type M<T> = Promise<StateResult<P<T>>>;

type N<T> = (scope: TypeScope, previousLeft: VariableSubstitution[], previousInferred: VariableSubstitution[]) => Promise<StateResult<P<T>>>;

export function fullConverge(leftValue: LazyValue, rightValue: LazyValue): N<Result> {
  return async (scope: TypeScope, previousLeft: VariableSubstitution[], previousInferences: VariableSubstitution[]) => {
    const state = State.of(scope);

    const newLeft = applySubstitutions(previousLeft, applyInferredSubstitutions(previousInferences, leftValue));
    const newRight = applyInferredSubstitutions(previousInferences, rightValue);

    const [{ left, right, inferred }] = await state.runAsync(convergeTypes, newLeft, newRight);

    return state.wrap<P<Result>>([
      { left, inferred },
      (nextLeft, nextInferred) => ({
        // TODO safely combine subs
        substitutions: [...right, ...nextLeft],
        inferred: nextInferred,
      }),
    ]);
  };
}

export async function sequenceConverges(scope: TypeScope, converges: N<Result>[]): M<Result[]> {
    const state = State.of(scope);

    // TODO check if the array is empty

    const [top, ...rest] = converges;
    const [{ left, inferred }, func] = await state.runAsync(sequenceConverges, rest);
    const [{ left: topLeft, inferred: topInferred }, topFunc] = await state.runAsync(top, left, inferred);

    return state.wrap<P<Result[]>>([
      { left: [...left, ...topLeft], inferred: [...inferred, ...topInferred] },
      (nextLeft, nextInferred) => [topFunc(nextLeft, nextInferred), ...func(nextLeft, nextInferred)],
    ]);
}

export function runM<T>(sequenceResult: P<T>): T {
  const [{ left, inferred }, func] = sequenceResult;
  return func(left, inferred);
}
