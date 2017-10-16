export type ValueKind = 'String'
  | 'Integer'
  | 'Float'
  | 'Boolean'
  | 'None'
  | 'Array'
  | 'Function';

export type PlainFunctionValue<R extends Value = Value> = (...args: LazyValue[]) => PromiseValue<R>;
export type PlainValue = string
  | number
  | boolean
  | null
  | Iterator<Promise<Value>>
  | PlainFunctionValue;

export interface ValueInterface<K extends ValueKind, V extends PlainValue> {
  kind: K,
  value: V,
}

export interface StringValue extends ValueInterface<'String', string> {}
export interface IntegerValue extends ValueInterface<'Integer', number> {}
export interface FloatValue extends ValueInterface<'Float', number> {}
export interface BooleanValue extends ValueInterface<'Boolean', boolean> {}
export interface NoneValue extends ValueInterface<'None', null> {}
export interface ArrayValue extends ValueInterface<'Array', Iterator<Promise<Value>>> {}
export interface FunctionValue extends ValueInterface<'Function', PlainFunctionValue> {}

export type Value = StringValue
  | IntegerValue
  | FloatValue
  | BooleanValue
  | NoneValue
  | FunctionValue
  | ArrayValue;

export type PromiseValue<T extends Value = Value> = Promise<T>;
export type LazyValue<T extends Value = Value> = () => PromiseValue<T>;


// Type constants
export const NoneValue: NoneValue = { kind: 'None', value: null };
export const BooleanTrueValue: BooleanValue = { kind: 'Boolean', value: true };
export const BooleanFalseValue: BooleanValue = { kind: 'Boolean', value: false };


// Type constructors
export function makeLazy<T extends Value>(arg: T): LazyValue<T> {
  return () => Promise.resolve(arg);
}

export function makeStringValue(value: string): StringValue {
  return {
    kind: 'String',
    value,
  };
}
export function makeLazyStringValue(value: string) {
  return makeLazy(makeStringValue(value));
}

export function makeIntegerValue(value: number): IntegerValue {
  return {
    kind: 'Integer',
    value,
  };
}
export function makeLazyIntegerValue(value: number) {
  return makeLazy(makeIntegerValue(value));
}

export function makeFloatValue(value: number): FloatValue {
  return {
    kind: 'Float',
    value,
  };
}
export function makeLazyFloatValue(value: number) {
  return makeLazy(makeFloatValue(value));
}

export function makeBooleanValue(value: boolean): BooleanValue {
  return {
    kind: 'Boolean',
    value,
  };
}
export function makeLazyBooleanValue(value: boolean) {
  return makeLazy(makeBooleanValue(value));
}

export function makeArrayValue(value: Iterator<Promise<Value>>): ArrayValue {
  return {
    kind: 'Array',
    value,
  };
}
export function makeLazyArrayValue(value: Iterator<Promise<Value>>) {
  return makeLazy(makeArrayValue(value));
}

export function makeFunctionValue(value: PlainFunctionValue): FunctionValue {
  return {
    kind: 'Function',
    value,
  };
}
export function makeLazyFunctionValue(value: PlainFunctionValue) {
  return makeLazy(makeFunctionValue(value));
}

