// import { makeMessage } from '../../message';
// import { TypeScope } from '../scope';
// import { pMap, splitAtLast } from '../utils';
// import { ValueKind, LazyValue } from '../value';
// import { functionLiteralType, lazyValue, nothing, functionType } from '../value-constructors';
// import { convergeTypes } from './converge-types';
// import { State, StateResult } from './state';
// import { Type, type } from './type';
// import { zip } from 'lodash';
//
// export default async function applyParameters(
//   scope: TypeScope,
//   callee: Type,
//   parameters: Type[],
// ): Promise<StateResult<Type>> {
//   const state = State.of(scope);
//
//   const calleeValue = await callee.value();
//   if (calleeValue.kind !== ValueKind.Application) {
//     return state.wrap(type(lazyValue(nothing)));
//   }
//
//   const calleeCalleeValue = await calleeValue.callee();
//   if (calleeCalleeValue.kind !== ValueKind.UserDefinedLiteral || calleeCalleeValue.name !== functionLiteralType.name) {
//     return state.wrap(type(lazyValue(nothing)));
//   }
//
//   const [expectedParameters, expectedResult] = splitAtLast(Array.from(calleeValue.parameters()));
//   if (!expectedResult) {
//     // TODO place this error correctly
//     state.log(makeMessage('Error', 'Lambda application type missing return value', [0, 0]));
//   }
//
//   const convergedParameters = await pMap(
//     zip(expectedParameters, parameters)
//       .slice(0, Math.min(expectedParameters.length, parameters.length)) as [LazyValue, Type][],
//     ([expectedParameter, givenParameterType]) => {
//       return state.runAsync(convergeTypes, expectedParameter, givenParameterType.value)
//     },
//   );
//   const remainingParameters = expectedParameters.slice(convergedParameters.length);
//
//   if (remainingParameters.length === 0) {
//     return state.wrap(type(expectedResult || lazyValue(nothing)));
//   }
//
//   return state.wrap(type(lazyValue(
//     functionType(...remainingParameters, expectedResult || lazyValue(nothing))
//   )));
// }
