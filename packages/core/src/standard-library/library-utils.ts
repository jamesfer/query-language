import {
  Boolean,
  Float,
  Integer,
  LazyValue,
  NativeLambdaBody, String,
  Value,
  ValueKind,
} from '../compiler/value';

/**
 * Returns a function that will automatically evaluate all its lazy arguments
 * and call the given function with values of them.
 */
export function evalArgs(func: (...args: Value[]) => LazyValue): NativeLambdaBody {
  return (...parameters) => async () => {
    const unwrappedArgs: Value[] = await Promise.all(parameters.map(parameter => parameter()));
    return await func(...unwrappedArgs)();
  };
}

function buildFunctionBinder<A extends Float | Integer | String | Boolean>(
  kind: A['kind'],
): (func: (...args: A['value'][]) => A['value']) => NativeLambdaBody {
  return func => evalArgs((...args: A[]) => async () => ({
    kind,
    value: func(...args.map(({ value }) => value)),
  } as A));
}

export const bindFloatFunction = buildFunctionBinder<Float>(ValueKind.Float);
export const bindIntegerFunction = buildFunctionBinder<Integer>(ValueKind.Integer);
export const bindBooleanFunction = buildFunctionBinder<Boolean>(ValueKind.Boolean);
export const bindStringFunction = buildFunctionBinder<String>(ValueKind.String);
