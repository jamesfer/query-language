import { Boolean, Float, LazyValue, NativeLambdaBody, Value, ValueKind } from '../compiler/value';

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

export function bindFloatFunction(func: (...args: number[]) => number): NativeLambdaBody {
  return evalArgs((...args: Float[]) => async () => ({
    kind: ValueKind.Float,
    value: func(...args.map(({ value }) => value)),
  }));
}

export function bindBooleanFunction(func: (...args: boolean[]) => boolean): NativeLambdaBody  {
  return evalArgs((...args: Boolean[]) => async () => ({
    kind: ValueKind.Boolean,
    value: func(...args.map(({ value }) => value)),
  }));
}
