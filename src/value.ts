import { Dictionary } from 'lodash';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

export type ValueKind = 'String'
  | 'Integer'
  | 'Float'
  | 'Boolean'
  | 'None'
  | 'Array'
  | 'Function'
  | 'Method'
  | 'Record';

export type PlainFunctionValue<R extends Value = Value> = (...args: LazyValue[]) => LazyValue<R>;
export type PlainValue = string
  | number
  | boolean
  | null
  | Observable<Value>
  | PlainFunctionValue
  | Dictionary<PlainFunctionValue>
  | Dictionary<Value>;

export interface ValueInterface<K extends ValueKind, V extends PlainValue> {
  kind: K,
  value: V,
}

export interface StringValue extends ValueInterface<'String', string> {}
export interface IntegerValue extends ValueInterface<'Integer', number> {}
export interface FloatValue extends ValueInterface<'Float', number> {}
export interface BooleanValue extends ValueInterface<'Boolean', boolean> {}
export interface NoneValue extends ValueInterface<'None', null> {}
export interface ArrayValue extends ValueInterface<'Array', Observable<Value>> {}
export interface FunctionValue extends ValueInterface<'Function', PlainFunctionValue> {}
export interface RecordValue extends ValueInterface<'Record', Dictionary<Value>> {}
export interface MethodValue extends ValueInterface<'Method', Dictionary<PlainFunctionValue>> {}

export type Value = StringValue
  | IntegerValue
  | FloatValue
  | BooleanValue
  | NoneValue
  | FunctionValue
  | ArrayValue
  | RecordValue
  | MethodValue;

export type LazyValue<T extends Value = Value> = Observable<T>;


// Type constants
export const NoneValue: NoneValue = { kind: 'None', value: null };
export const LazyNoneValue: LazyValue<NoneValue> = Observable.of(NoneValue);
export const TrueValue: BooleanValue = { kind: 'Boolean', value: true };
export const LazyTrueValue: LazyValue<BooleanValue> = Observable.of(TrueValue);
export const FalseValue: BooleanValue = { kind: 'Boolean', value: false };
export const LazyFalseValue: LazyValue<BooleanValue> = Observable.of(FalseValue);


// Type constructors
export function makeLazy<T extends Value>(arg: T): LazyValue<T> {
  return Observable.of(arg);
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

export function makeArrayValue(value: Observable<Value>): ArrayValue {
  return {
    kind: 'Array',
    value,
  };
}
export function makeLazyArrayValue(value: Observable<Value>) {
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

export function makeMethodValue(value: Dictionary<PlainFunctionValue>): MethodValue {
  return {
    kind: 'Method',
    value,
  };
}
export function makeLazyMethodValue(value: Dictionary<PlainFunctionValue>) {
  return makeLazy(makeMethodValue(value));
}

export function makeRecordValue(value: Dictionary<Value>): RecordValue {
  return {
    kind: 'Record',
    value,
  };
}
export function makeLazyRecordValue(value: Dictionary<Value>) {
  return makeLazy(makeRecordValue(value));
}
