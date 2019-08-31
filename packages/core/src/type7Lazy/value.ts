
export enum ValueKind {
  Anything = 'Anything',
  Nothing = 'Nothing',
  UserDefinedLiteral = 'UserDefinedLiteral',
  TypeInterface = 'TypeInterface',
  UnboundVariable = 'UnboundVariable',
  BoundVariable = 'BoundVariable',
  Lambda = 'Lambda',
  NativeLambda = 'NativeLambda',
  Application = 'Application',
  Integer = 'Integer',
  Float = 'Float',
  String = 'String',
  Boolean = 'Boolean',
  List = 'List',
}

export interface Anything {
  kind: ValueKind.Anything;
}

export interface Nothing {
  kind: ValueKind.Nothing;
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

export interface UserDefinedLiteral {
  kind: ValueKind.UserDefinedLiteral;
  name: string;
}

// export interface TypeInterface {
//   kind: ValueKind.TypeInterface;
//   name: string;
// }

export interface UnboundVariable {
  kind: ValueKind.UnboundVariable;
  name: string;
  uniqueIdentifier: string;
}

export interface BoundVariable {
  kind: ValueKind.BoundVariable;
  name: string;
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

export type Value =
  | Anything
  | Nothing
  // These are the types of the individual literals: 3, true, "hello"
  | Integer
  | Float
  | String
  | Boolean
  | UnboundVariable
  | BoundVariable
  // This is the type for every common type you would run into: Integer, Boolean, LengthUnit
  // as well as "case classes" or "data declarations"
  // TODO the name "UserDefined" is pretty confusing because they won't necessarily be defined by
  //      the user. Integer, Boolean etc will all use this type but will be built in
  | UserDefinedLiteral
  // Composite types
  // | TypeInterface
  | Lambda
  | NativeLambda
  | Application
  | List;

export type LazyValue<V extends Value = Value> = () => Promise<V>;

export type LazyValueList = () => Iterable<LazyValue>;
