import { findVariableTypeInScope, TypeScope } from '../scope';
import { pReduce } from '../utils';
import { LazyValue } from '../value';
import { functionType, lazyValue } from '../value-constructors';
import { State, StateResult } from './state';
import { type, Type } from './type';
import { freeVariable } from './utils';

export async function makeInferredFunctionType(
  scope: TypeScope,
  bodyType: Type,
  parameterNames: string[],
): Promise<StateResult<Type>> {
  const state = State.of(scope);

  // Determine the inferred type of each of the arguments
  const inferredParameterTypes = await pReduce(
    parameterNames,
    [] as LazyValue[],
    async (otherParameters, parameter) => [
      ...otherParameters,
      findVariableTypeInScope(state.scope(), parameter)
        || lazyValue(await freeVariable('p', [bodyType.value, ...otherParameters]))
    ],
  );

  // TODO work out if we need to do this
  // const parameterConstraints = ([] as TypeConstraints).concat(
  //   ...inferredParameterTypes.map(parameterType => parameterType ? parameterType.constraints : []),
  // );

  // Create the whole function type based on the types of the parameters and body
  return state.wrap(type(
    functionType(...inferredParameterTypes, bodyType.value),
    bodyType.constraints,
  ));
}
