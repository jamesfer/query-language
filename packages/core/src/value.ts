import { Dictionary } from 'lodash';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { Expression } from './expression';

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
  | Dictionary<Value>
  | Expression;

export interface ValueInterface<K extends ValueKind, V extends PlainValue> {
  kind: K;
  value: V;
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
export const noneValue: NoneValue = { kind: 'None', value: null };
export const lazyNoneValue: LazyValue<NoneValue> = Observable.of(noneValue);
export const trueValue: BooleanValue = { kind: 'Boolean', value: true };
export const lazyTrueValue: LazyValue<BooleanValue> = Observable.of(trueValue);
export const falseValue: BooleanValue = { kind: 'Boolean', value: false };
export const lazyFalseValue: LazyValue<BooleanValue> = Observable.of(falseValue);


// Type constructors
export function makeLazy<T extends Value>(arg: T): LazyValue<T> {
  return Observable.of(arg);
}

export function makeStringValue(value: string): StringValue {
  return {
    value,
    kind: 'String',
  };
}
export function makeLazyStringValue(value: string) {
  return makeLazy(makeStringValue(value));
}

export function makeIntegerValue(value: number): IntegerValue {
  return {
    value,
    kind: 'Integer',
  };
}
export function makeLazyIntegerValue(value: number) {
  return makeLazy(makeIntegerValue(value));
}

export function makeFloatValue(value: number): FloatValue {
  return {
    value,
    kind: 'Float',
  };
}
export function makeLazyFloatValue(value: number) {
  return makeLazy(makeFloatValue(value));
}

export function makeBooleanValue(value: boolean): BooleanValue {
  return {
    value,
    kind: 'Boolean',
  };
}
export function makeLazyBooleanValue(value: boolean) {
  return makeLazy(makeBooleanValue(value));
}

export function makeArrayValue(value: Observable<Value>): ArrayValue {
  return {
    value,
    kind: 'Array',
  };
}
export function makeLazyArrayValue(value: Observable<Value>) {
  return makeLazy(makeArrayValue(value));
}

export function makeFunctionValue(value: PlainFunctionValue): FunctionValue {
  return {
    value,
    kind: 'Function',
  };
}
export function makeLazyFunctionValue(value: PlainFunctionValue) {
  return makeLazy(makeFunctionValue(value));
}

export function makeMethodValue(value: Dictionary<PlainFunctionValue>): MethodValue {
  return {
    value,
    kind: 'Method',
  };
}
export function makeLazyMethodValue(value: Dictionary<PlainFunctionValue>) {
  return makeLazy(makeMethodValue(value));
}

export function makeRecordValue(value: Dictionary<Value>): RecordValue {
  return {
    value,
    kind: 'Record',
  };
}
export function makeLazyRecordValue(value: Dictionary<Value>) {
  return makeLazy(makeRecordValue(value));
}
