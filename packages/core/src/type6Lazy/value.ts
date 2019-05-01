export enum ValueKind {
  Anything,
  Nothing,
  UserDefinedLiteral,
  TypeInterface,
  UnboundVariable,
  Lambda,
  NativeLambda,
  Application,
  Integer,
  Float,
  String,
  Boolean,
  List,
}

export interface Anything {
  kind: ValueKind.Anything;
}

export interface Nothing {
  kind: ValueKind.Nothing;
}

export interface UserDefinedLiteral {
  kind: ValueKind.UserDefinedLiteral;
  name: string;
}

export interface TypeInterface {
  kind: ValueKind.TypeInterface;
  name: string;
}

export interface UnboundVariable {
  kind: ValueKind.UnboundVariable;
  name: string;
  uniqueIdentifier: string;
}

export interface Lambda {
  kind: ValueKind.Lambda;
  parameterNames: string[];
  body: LazyValue;
}

export interface NativeLambda {
  kind: ValueKind.NativeLambda;
  parameterCount: number;
  body: (...parameters: LazyValue[]) => LazyValue;
}

export interface Application {
  kind: ValueKind.Application;
  callee: LazyValue;
  parameters: LazyValueList;
}

export interface Integer {
  kind: ValueKind.Integer;
  value: number;
}

export interface Float {
  kind: ValueKind.Float;
  value: number;
}

export interface String {
  kind: ValueKind.String;
  value: string;
}

export interface Boolean {
  kind: ValueKind.Boolean;
  value: boolean;
}

export interface List {
  kind: ValueKind.List;
  values: LazyValueList;
}

export type Value =
  | Anything
  | Nothing
  | UnboundVariable
  | UserDefinedLiteral
  | TypeInterface
  | Lambda
  | NativeLambda
  | Application
  | Integer
  | Float
  | String
  | Boolean
  | List;

export type LazyValue<V extends Value = Value> = () => Promise<V>;

export type LazyValueList = () => Iterable<LazyValue>;
