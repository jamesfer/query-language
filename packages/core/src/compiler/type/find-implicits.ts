import { TypeScope } from '../scope';
import { State, StateResult } from './state';
import { Expression } from '../expression';
import { VariableSubstitution } from './variable-substitutions';

/**
 * Finds any implicit parameters that have been entirely fulfilled by the given substitutions and
 * attempts to find implementations of them in the scope. If a implicit parameter is entirely
 * specified but it doesn't exist, an error message will be added to the result.
 */
export async function findImplicits(
  scope: TypeScope,
  substitutions: VariableSubstitution[],
  expression: Expression,
): Promise<StateResult<Expression>> {
  // TODO finish this implementation
  return State.of(scope).wrap(expression);
}
