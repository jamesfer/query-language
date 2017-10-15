export type ValueKind = 'String'
  | 'Integer'
  | 'Float'
  | 'Boolean'
  | 'None'
  | 'Array'
  | 'Function';

export type PlainFunctionValue = ((...args: LazyValue[]) => Value);
export type PlainValue = string
  | number
  | boolean
  | null
  | Iterator<Value>
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
export interface ArrayValue extends ValueInterface<'Array', Iterator<Value>> {}
export interface FunctionValue extends ValueInterface<'Function', PlainFunctionValue> {}

export type Value = StringValue
  | IntegerValue
  | FloatValue
  | BooleanValue
  | NoneValue
  | FunctionValue
  | ArrayValue;

export type LazyValue<T extends Value = Value> = () => T;


export const NoneValue: NoneValue = { kind: 'None', value: null };
export const BooleanTrueValue: BooleanValue = { kind: 'Boolean', value: true };
export const BooleanFalseValue: BooleanValue = { kind: 'Boolean', value: false };

export function makeStringValue(value: string): StringValue {
  return {
    kind: 'String',
    value,
  };
}

export function makeIntegerValue(value: number): IntegerValue {
  return {
    kind: 'Integer',
    value,
  };
}

export function makeFloatValue(value: number): FloatValue {
  return {
    kind: 'Float',
    value,
  };
}

export function makeBooleanValue(value: boolean): BooleanValue {
  return {
    kind: 'Boolean',
    value,
  };
}

export function makeArrayValue(value: Iterator<Value>): ArrayValue {
  return {
    kind: 'Array',
    value,
  };
}

export function makeFunctionValue(value: PlainFunctionValue): FunctionValue {
  return {
    kind: 'Function',
    value,
  };
}

