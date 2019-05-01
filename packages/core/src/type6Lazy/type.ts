import { map, mapValues, once } from 'lodash';
import { Message } from '../message';
import { UntypedExpression } from '../untyped-expression';
import { assertNever } from '../utils';
import {
  ApplicationExpression,
  BooleanExpression,
  Expression,
  ExpressionKind,
  FloatExpression,
  IdentifierExpression,
  IntegerExpression,
  LambdaExpression,
  ListExpression,
  NothingExpression,
  StringExpression,
} from './expression';
import {
  assignVariableType,
  createChildScope,
  findVariableInTypeScope,
  overwriteScope,
  Scope,
  TypeScope,
} from './scope';
import { Application, LazyValue, LazyValueList, UnboundVariable, Value, ValueKind } from './value';
import {
  booleanType,
  floatType,
  functionType,
  integerType,
  listType,
  nothing,
  stringType,
  unboundVariable,
} from './value-constructors';


export interface TypeConstraint {
  kind: 'TypeConstraint';
  child: LazyValue;
  parents: LazyValueList;
}

export type TypeConstraints = TypeConstraint[];

export interface Type {
  kind: 'Type';
  value: LazyValue;
  constraints: TypeConstraints;
}

export interface SubtypeRelationship {
  kind: 'SubtypeRelationship';
  parent: UnboundVariable;
  child: UnboundVariable;
}

export interface TypeImplementation {
  kind: 'TypeImplementation';
  parentType: LazyValue;
  childType: LazyValue;
  constraints: TypeConstraints;
}

// TODO convert string literals to an enum
export interface UserDefinedLiteralDeclaration {
  kind: 'UserDefinedLiteralDeclaration';
  name: string;
  parameterNames: string;
}

export interface LambdaDeclaration {
  kind: 'LambdaDeclaration';
  name: string;
  parameterNames: string[];
  body: Expression;
}

export type TypeDeclaration =
  | UserDefinedLiteralDeclaration
  | LambdaDeclaration;

// export interface TypeScope {
//   // List of implementations of an interface type
//   implementations: TypeImplementation[];
//
//   // List of subtype relationships between types
//   subtypeRelationships: SubtypeRelationship[];
//
//   // Map of all type declarations
//   // This is used to look up the value of an identifier
//   declarations: { [k: string]: TypeDeclaration };
// }

export function lookUpDeclaration(
  scope: Scope,
  variable: IdentifierExpression,
): TypeDeclaration | undefined {
  // TODO come up with a better policy for whether to use undefined or null
  return scope.declarations ? scope.declarations[variable.name] : undefined;
}

export function makeType(value: LazyValue, constraints: TypeConstraints = []): Type {
  return {
    value,
    constraints,
    kind: 'Type',
  };
}



function equal(left: any, right: any) {
  return left === right;
}

function arraysAreEqual<T>(
  left: T[],
  right: T[],
  comparator: (left: T, right: T) => boolean = equal,
): boolean {
  return left.length === right.length
    && left.every((item, index) => comparator(item, right[index]));
}

async function compactArrayWith<T>(
  array: T[],
  canCompact: (left: T, right: T) => boolean | Promise<boolean>,
  compact: (left: T, right: T) => T | Promise<T>,
): Promise<T[]> {
  const result: T[] = [];
  let remaining = [...array];
  let current = remaining.pop();
  while (current) {
    let index = 0;
    while (index < remaining.length) {
      if (await canCompact(current, remaining[index])) {
        current = await compact(current, remaining[index]);
        remaining = remaining.splice(index, 1);
      } else {
        index += 1;
      }
    }

    result.push(current);
    current = remaining.pop();
  }

  return result;
}

export function mapIterator<T, U>(
  iterable: Iterable<T>,
  iteratee: (item: T, index: number) => U,
): () => Iterable<U> {
  return function* () {
    let index = 0;
    for (const item of iterable) {
      yield iteratee(item, index);
      index++;
    }
  };
}

async function iteratorsEqual<T>(
  left: Iterable<T>,
  right: Iterable<T>,
  comparator: (left: T, right: T) => Promise<boolean> | boolean,
): Promise<boolean> {
  const leftIterator = left[Symbol.iterator]();
  const rightIterator = right[Symbol.iterator]();

  while (true) {
    let leftResult = await leftIterator.next();
    let rightResult = await rightIterator.next();

    if (leftResult.done && rightResult.done) {
      return true;
    }

    if (leftResult.done || rightResult.done) {
      return false;
    }

    if (!await comparator(leftResult.value, rightResult.value)) {
      return false;
    }
  }
}

async function pIterateSome<T>(list: Iterable<T>, iteratee: (value: T) => Promise<boolean>) {
  for (const element of list) {
    if (await iteratee(element)) {
      return true;
    }
  }
  return false;
}

async function pSome<T>(
  list: T[],
  iteratee: (element: T, index: number, list: T[]) => Promise<boolean>,
): Promise<boolean> {
  for (let i = 0; i < list.length; i++) {
    if (await iteratee(list[i], i, list)) {
      return true;
    }
  }
  return false;
}

async function pEvery<T>(
  list: T[],
  iteratee: (element: T, index: number, list: T[]) => Promise<boolean>,
): Promise<boolean> {
  for (let i = 0; i < list.length; i++) {
    if (!await iteratee(list[i], i, list)) {
      return false;
    }
  }
  return true;
}

async function pFilter<T>(
  list: T[],
  iteratee: (element: T) => Promise<boolean>,
): Promise<T[]> {
  const result = [];
  for (let i = 0; i < list.length; i++) {
    if (await iteratee(list[i])) {
      result.push(list[i]);
    }
  }
  return result;
}

async function pMap<T, U>(
  list: T[],
  iteratee: (element: T) => Promise<U>,
): Promise<U[]> {
  const result = [];
  for (let i = 0; i < list.length; i++) {
    result.push(await iteratee(list[i]));
  }
  return result;
}

function makeLazy<T>(value: T) {
  return async () => value;
}

function iterableToList<T>(iterable: Iterable<T>): T[] {
  const result = [];
  for (const element of iterable) {
    result.push(element);
  }
  return result;
}







function substituteVariable(
  lazyType: LazyValue,
  name: string,
  lazyValue: LazyValue,
): LazyValue {
  return once(async (): Promise<Value> => {
    const type = await lazyType();
    switch (type.kind) {
      case ValueKind.Anything:
      case ValueKind.Nothing:
      case ValueKind.Integer:
      case ValueKind.Float:
      case ValueKind.String:
      case ValueKind.Boolean:
      case ValueKind.UserDefinedLiteral:
      case ValueKind.TypeInterface:
      case ValueKind.NativeLambda:
        return type;

      case ValueKind.UnboundVariable:
        return type.name === name ? lazyValue() : type;

      case ValueKind.List:
        return {
          ...type,
          values: mapIterator(type.values(), element => (
            substituteVariable(element, name, lazyValue)
          )),
        };

      case ValueKind.Lambda:
        return type.parameterNames.includes(name) ? type : {
          kind: ValueKind.Lambda,
          parameterNames: type.parameterNames,
          body: substituteVariable(type.body, name, lazyValue),
        };

      case ValueKind.Application:
        return {
          kind: ValueKind.Application,
          callee: substituteVariable(type.callee, name, lazyValue),
          parameters: mapIterator(type.parameters(), parameter => (
            substituteVariable(parameter, name, lazyValue)
          )),
        };

      default:
        return assertNever(type);
    }
  });
}

async function typeValuesAreEqual(lazyLeft: LazyValue, lazyRight: LazyValue): Promise<boolean> {
  const left = await lazyLeft();
  const right = await lazyRight();

  switch (left.kind) {
    case ValueKind.Anything:
    case ValueKind.Nothing:
      return right.kind === left.kind;

    case ValueKind.Integer:
    case ValueKind.Float:
    case ValueKind.String:
    case ValueKind.Boolean:
      return right.kind === left.kind && right.value === left.value;

    case ValueKind.UnboundVariable:
    case ValueKind.UserDefinedLiteral:
    case ValueKind.TypeInterface:
      return right.kind === left.kind && right.name === left.name;

    case ValueKind.NativeLambda:
      return right.kind === ValueKind.NativeLambda && right.body === left.body;

    case ValueKind.List:
      return right.kind === ValueKind.List &&
        await iteratorsEqual(right.values(), left.values(), typeValuesAreEqual);

    case ValueKind.Lambda:
      return right.kind === ValueKind.Lambda
        && arraysAreEqual(right.parameterNames, left.parameterNames)
        && typeValuesAreEqual(left.body, right.body);

    case ValueKind.Application:
      return right.kind === ValueKind.Application
        && iteratorsEqual(right.parameters(), left.parameters(), typeValuesAreEqual)
        && typeValuesAreEqual(left.callee, right.callee);

    default:
      return assertNever(left);
  }
}

async function satisfiesConstraint(
  scope: TypeScope,
  constraint: TypeConstraint,
  type: LazyValue,
): Promise<boolean> {
  // If this constraint does not apply to the type we are testing, then immediately return true
  if (!typeValuesAreEqual(constraint.child, type)) {
    return true;
  }

  for (const lazyParent of constraint.parents()) {
    const parent = await lazyParent();
    switch (parent.kind) {
      case ValueKind.Anything:
        break;

      case ValueKind.Nothing:
      case ValueKind.Integer:
      case ValueKind.Float:
      case ValueKind.String:
      case ValueKind.Boolean:
      case ValueKind.List:
      case ValueKind.NativeLambda:
        return false;

      case ValueKind.UnboundVariable:
        // TODO is this really the correct response
        break;

      case ValueKind.UserDefinedLiteral: {
        // Find a subtype relationship defined for this literal
        const relationExists = await pSome(scope.subtypeRelationships || [], async (relationship) => {
          const childMatches = typeValuesAreEqual(makeLazy(relationship.child), type);
          const parentMatches = typeValuesAreEqual(makeLazy(relationship.parent), makeLazy(parent));
          const [childExists, parentExists] = await Promise.all([childMatches, parentMatches]);
          return childExists && parentExists;
        });
        if (!relationExists) {
          return false;
        }
        break;
      }

      case ValueKind.TypeInterface: {
        // Find an implementation is defined for this interface
        const implementationExists = await pSome(scope.implementations || [], async (implementation) => {
          const childMatches = typeValuesAreEqual(implementation.childType, type);
          const parentMatches = typeValuesAreEqual(implementation.parentType, makeLazy(parent));
          const [childExists, parentExists] = await Promise.all([childMatches, parentMatches]);
          if (!childExists || !parentExists) {
            return false;
          }

          return pEvery(implementation.constraints, constraint => (
            satisfiesConstraint(scope, constraint, type)
          ));
        });
        if (!implementationExists) {
          return false;
        }
        break;
      }

      case ValueKind.Lambda:
        // TODO this should check that the child is also a function
        return false;

      case ValueKind.Application:
        // TODO this should look for a subtype relationship or implementation in the scope just like it does for literals and interfaces
        return false;


      default:
        return assertNever(parent);
    }
  }

  return true;
}

export async function isSubtypeUnit(
  scope: TypeScope,
  lazyType: LazyValue,
  lazySubtype: LazyValue,
  typeConstraints: TypeConstraints,
  subtypeConstraints: TypeConstraints,
): Promise<boolean> {
  // These types do not require the subtype to evaluated
  const type = await lazyType();
  if (type.kind === ValueKind.Anything) {
    return true;
  }
  if (type.kind === ValueKind.Nothing) {
    return false;
  }
  if (type.kind === ValueKind.UnboundVariable) {
    return pEvery(typeConstraints, constraint => (
      satisfiesConstraint(scope, constraint, lazySubtype)
    ));
  }

  const subtype = await lazySubtype();
  switch (type.kind) {
    case ValueKind.Integer:
    case ValueKind.Float:
    case ValueKind.String:
    case ValueKind.Boolean:
      return subtype.kind === type.kind
        && subtype.value === type.value;

    case ValueKind.UserDefinedLiteral:
    case ValueKind.TypeInterface:
      return subtype.kind === type.kind
        && subtype.name === type.name;

    case ValueKind.List:
      return subtype.kind === ValueKind.List
        && iteratorsEqual(subtype.values(), type.values(), (subValue, typeValue) => (
          isSubtypeUnit(scope, typeValue, subValue, typeConstraints, subtypeConstraints)
        ));

    case ValueKind.Lambda:
      return subtype.kind === ValueKind.Lambda
        && arraysAreEqual(subtype.parameterNames, type.parameterNames);

    case ValueKind.NativeLambda:
      return subtype.kind === ValueKind.NativeLambda
        && subtype.body === type.body;

    case ValueKind.Application:
      return subtype.kind === ValueKind.Application
        && iteratorsEqual(subtype.parameters(), type.parameters(), (subParameter, typeParameter) => (
          isSubtypeUnit(scope, typeParameter, subParameter, typeConstraints, subtypeConstraints)
        ));

    default:
      return assertNever(type);
  }
}

export function isSubtype(scope: TypeScope, type: Type, subtype: Type): Promise<boolean> {
  return isSubtypeUnit(scope, type.value, subtype.value, type.constraints, subtype.constraints);
}




interface PartialFunctionType {
  constraints: TypeConstraints;
  futureParameters: LazyValue[];
  skippedParameters: LazyValue[];
  returnType: LazyValue;
}

async function makePartialFunctionType(type: Type | null): Promise<PartialFunctionType | null> {
  if (!type) {
    return null;
  }

  const value = await type.value();
  if (value.kind !== ValueKind.Application) {
    return null;
  }

  const allParameters = iterableToList(value.parameters());
  return {
    constraints: type.constraints,
    futureParameters: allParameters.slice(0, allParameters.length - 1),
    skippedParameters: [],
    returnType: allParameters[allParameters.length - 1],
  };
}

function skipParameter(partialFunction: PartialFunctionType | null): PartialFunctionType | null {
  if (!partialFunction) {
    return null;
  }

  if (partialFunction.futureParameters.length < 1) {
    return partialFunction;
  }

  return {
    ...partialFunction,
    futureParameters: partialFunction.futureParameters.slice(0),
    skippedParameters: [...partialFunction.skippedParameters, partialFunction.futureParameters[0]],
  };
}

function nextParameter(partialFunction: PartialFunctionType | null): LazyValue | null {
  return partialFunction && partialFunction.futureParameters.length >= 1
    ? partialFunction.futureParameters[0]
    : null;
}

function applyParameter(partialFunction: PartialFunctionType, newConstraints?: TypeConstraints): PartialFunctionType | null {
  if (!partialFunction) {
    return null;
  }

  return {
    ...partialFunction,
    // TODO should this merge
    constraints: newConstraints || partialFunction.constraints,
    futureParameters: partialFunction.futureParameters.slice(1),
  };
}

function determineResultType(partialFunction: PartialFunctionType): Type {
  return makeType(
    makeLazy(functionType(
      ...partialFunction.skippedParameters,
      ...partialFunction.futureParameters,
      partialFunction.returnType,
    )),
    partialFunction.constraints,
  );
}

export interface MutableState {
  scope: TypeScope
}

export interface FullState {
  scope: TypeScope,
  messages: Message[],
}

export type StateResult<R> = [FullState, R];

class State<S> {
  static of<S>(state: MutableState): State<S> {
    return new State<S>(state);
  }

  mutableState(): MutableState {
    return this.fullState;
  }

  wrap<T>(value: T): StateResult<T> {
    return [this.fullState, value];
  }

  scope() {
    return this.fullState.scope;
  }

  setScope(scope: TypeScope) {
    this.fullState.scope = scope;
  }

  messages() {
    return this.fullState.messages;
  }

  addMessage(message: Message) {
    this.fullState.messages.push(message);
  }

  run<T1, R>(fn: (state: MutableState, a1: T1) => StateResult<R>, a1: T1): R;
  run<T1, T2, R>(fn: (state: MutableState, a1: T1, a2: T2) => StateResult<R>, a1: T1, a2: T2): R;
  run<T1, T2, T3, R>(fn: (state: MutableState, a1: T1, a2: T2, a3: T3) => StateResult<R>, a1: T1, a2: T2, a3: T3): R;
  run<T1, T2, T3, T4, R>(fn: (state: MutableState, a1: T1, a2: T2, a3: T3, a4: T4) => StateResult<R>, a1: T1, a2: T2, a3: T3, a4: T4): R;
  run<T, R>(fn: (state: MutableState, ...args: T[]) => StateResult<R>, ...args: T[]): R {
    return this.combine(fn(this.mutableState(), ...args));
  }

  runAsync<T1, R>(fn: (state: MutableState, a1: T1) => Promise<StateResult<R>>, a1: T1): Promise<R>;
  runAsync<T1, T2, R>(fn: (state: MutableState, a1: T1, a2: T2) => Promise<StateResult<R>>, a1: T1, a2: T2): Promise<R>;
  runAsync<T1, T2, T3, R>(fn: (state: MutableState, a1: T1, a2: T2, a3: T3) => Promise<StateResult<R>>, a1: T1, a2: T2, a3: T3): Promise<R>;
  runAsync<T1, T2, T3, T4, R>(fn: (state: MutableState, a1: T1, a2: T2, a3: T3, a4: T4) => Promise<StateResult<R>>, a1: T1, a2: T2, a3: T3, a4: T4): Promise<R>;
  async runAsync<T, R>(fn: (state: MutableState, ...args: T[]) => Promise<StateResult<R>>, ...args: T[]): Promise<R> {
    return this.combine(await fn(this.mutableState(), ...args));
  }

  combine<T>([newState, result]: StateResult<T>): T {
    this.updateState(newState);
    return result;
  }

  private fullState: FullState;

  private constructor(mutableState: MutableState) {
    this.fullState = {
      scope: mutableState.scope,
      messages: [],
    };
  }

  private updateState(newState: FullState) {
    this.fullState = {
      scope: overwriteScope(this.fullState.scope, newState.scope),
      messages: [...this.fullState.messages, ...newState.messages],
    };
  }
}

async function makeInferredFunctionType(
  stateValue: MutableState,
  bodyType: Type | null,
  parameterVariables: UnboundVariable[],
): Promise<StateResult<Type>> {
  const state = State.of(stateValue);

  // Determine the inferred type of each of the arguments
  const inferredParameterTypes = parameterVariables.map(variable => (
    findVariableInTypeScope(state.scope(), variable.name)
  ));
  const inferredParameterValues = inferredParameterTypes.map(type => type ? type.value : makeLazy(nothing));
  const parameterConstraints = ([] as TypeConstraints).concat(
    ...inferredParameterTypes.map(parameterType => parameterType ? parameterType.constraints : []),
  );

  // If the body couldn't be typed, just assume it returns nothing
  if (!bodyType) {
    return state.wrap(makeType(
      makeLazy(functionType(...inferredParameterValues, makeLazy(nothing))),
      parameterConstraints,
    ));
  }

  // Create the whole function type based on the types of the parameters and body
  return state.wrap(makeType(
    makeLazy(functionType(...inferredParameterValues, bodyType.value)),
    [...parameterConstraints, ...bodyType.constraints],
  ));
}

// TODO handle errors better
export async function typeExpression(stateValue: MutableState, expression: UntypedExpression): Promise<StateResult<Expression>> {
  const state = State.of(stateValue);
  switch (expression.kind) {
    case 'Function': {
      // Create an unbound variable for each of the parameters
      const parameterTypes = expression.arguments.reduce(
        (typeMap, parameter) => {
          // TODO generate a unique name for unbound variables
          const variable = unboundVariable(`${parameter.value}T`);
          typeMap[variable.name] = {
            name: parameter.value,
            variable,
            type: makeType(async () => variable),
          };
          return typeMap;
        },
        {},
      );

      // Extend the scope with the new parameter types
      state.setScope(createChildScope(state.scope(), mapValues(parameterTypes, 'type')));

      // Type the function body
      const typedBody = await state.runAsync(typeExpression, expression.value);

      // Determine the type of the whole function
      const inferredFunctionType = await state.runAsync(
        makeInferredFunctionType,
        typedBody.resultType,
        map(parameterTypes, 'variable'),
      );

      return state.wrap<LambdaExpression>({
        kind: ExpressionKind.Lambda,
        parameterNames: map(parameterTypes, 'name'),
        body: typedBody,
        resultType: inferredFunctionType,
        tokens: expression.tokens,
      });
    }

    case 'FunctionCall': {
      const typedCallee = await state.runAsync(typeExpression, expression.functionExpression);
      let partialFunctionType = await makePartialFunctionType(typedCallee.resultType);
      const typedParameters = await pMap(expression.args, async (parameter) => {
        // Skip the parameter if it is null
        if (parameter === null) {
          partialFunctionType = skipParameter(partialFunctionType);
          return null;
        }

        const typedParameter = await state.runAsync(typeExpression, parameter);
        if (!typedParameter.resultType) {
          // No need to raise a message if the typeExpression call failed to produce a type because
          // it would have already raised one.
          return typedParameter;
        }

        const expectedType = nextParameter(partialFunctionType);
        if (!expectedType) {
          // If the expected type is null, it probably means that the type of the callee couldn't be
          // determined or there are too many arguments. In both scenarios a message would have
          // already been raised.
          partialFunctionType = applyParameter(partialFunctionType);
          return typedParameter;
        }

        // TODO this should update the scope
        const [convergedType, convergedConstraints] = await convergeTypeValues(
          state.scope(),
          expectedType,
          partialFunctionType.constraints,
          typedParameter.resultType.value,
          typedParameter.resultType.constraints,
        );
        if (!convergedType) {
          // If the expected and actual types couldn't be converged, it means that they are
          // incompatible.
          // TODO handle errors better
          throw new Error('Failed to converge parameter types');
        }

        // We don't do anything with the converged parameter here because the converging process
        // will have updated the scope with new values for any unbound variables.
        partialFunctionType = applyParameter(partialFunctionType, convergedConstraints);
        return typedParameter;
      });

      return state.wrap<ApplicationExpression>({
        kind: ExpressionKind.Application,
        callee: typedCallee,
        parameters: typedParameters,
        resultType: determineResultType(partialFunctionType),
        tokens: expression.tokens,
      });
    }

    case 'Array': {
      // Type each of the elements
      let combinedElementType: LazyValue = makeLazy(unboundVariable('T'));
      let combinedElementConstraints: TypeConstraints = [];
      const typedElements = await pMap(expression.elements, async element => {
        const typedElement = await state.runAsync(typeExpression, element);

        // Converge the current element type with the type of all of the elements
        // TODO this needs to update the scope
        const [elementType, elementConstraints] = await convergeTypeValues(
          state.scope(),
          combinedElementType,
          combinedElementConstraints,
          typedElement.resultType ? typedElement.resultType.value : async () => nothing,
          typedElement.resultType ? typedElement.resultType.constraints : [],
        );

        if (elementType) {
          combinedElementType = elementType;
          combinedElementConstraints = elementConstraints;
        } else {
          // TODO handle errors better
          throw new Error('Array element does not match element type');
        }

        return typedElement;
      });

      return state.wrap<ListExpression>({
        kind: ExpressionKind.List,
        resultType: makeType(async () => listType(combinedElementType)),
        tokens: expression.tokens,
        elements: typedElements,
      });
    }

    case 'Identifier': {
      const variable = findVariableInTypeScope(state.scope(), expression.value);
      return state.wrap<IdentifierExpression>({
        kind: ExpressionKind.Identifier,
        resultType: variable ? variable : makeType(async () => nothing),
        tokens: expression.tokens,
        name: expression.value,
      });
    }

    case 'Boolean':
      return state.wrap<BooleanExpression>({
        kind: ExpressionKind.Boolean,
        resultType: makeType(async () => booleanType),
        tokens: expression.tokens,
        value: expression.value,
      });

    case 'String':
      return state.wrap<StringExpression>({
        kind: ExpressionKind.String,
        resultType: makeType(async () => stringType),
        tokens: expression.tokens,
        value: expression.value,
      });

    case 'Float':
      return state.wrap<FloatExpression>({
        kind: ExpressionKind.Float,
        resultType: makeType(async () => floatType),
        tokens: expression.tokens,
        value: expression.value,
      });

    case 'Integer':
      return state.wrap<IntegerExpression>({
        kind: ExpressionKind.Integer,
        resultType: makeType(async () => integerType),
        tokens: expression.tokens,
        value: expression.value,
      });

    case 'None':
      return state.wrap<NothingExpression>({
        kind: ExpressionKind.Nothing,
        resultType: makeType(async () => nothing),
        tokens: expression.tokens,
      });

    case 'Unrecognized':
      // TODO handle errors better
      throw new Error('Cannot type unrecognized expression');

    default:
      return assertNever(expression);
  }
}

async function isConcrete(scope: TypeScope, lazyValue: LazyValue): Promise<boolean> {
  const value = await lazyValue();
  switch (value.kind) {
    case ValueKind.Application:
      return await isConcrete(scope, value.callee) && await isConcreteIterable(scope, value.parameters);

    case ValueKind.List:
      return await isConcreteIterable(scope, value.values);

    case ValueKind.UnboundVariable:{
      const variableValue = findVariableInTypeScope(scope, value.name);
      return variableValue ? isConcrete(scope, variableValue.value) : false;
    }

    case ValueKind.Lambda:
      return false;

    case ValueKind.Integer:
    case ValueKind.Float:
    case ValueKind.String:
    case ValueKind.Boolean:
    case ValueKind.Nothing:
    case ValueKind.Anything:
    case ValueKind.UserDefinedLiteral:
    case ValueKind.TypeInterface:
    case ValueKind.NativeLambda:
      return true;


    default:
      return assertNever(value);
  }
}

async function isConcreteIterable(scope: TypeScope, values: LazyValueList): Promise<boolean> {
  for (const value of values()) {
    if (!await isConcrete(scope, value)) {
      return false;
    }
  }
  return true;
}

// async function isConcreteConstraint(scope: TypeScope, constraint: TypeConstraint): Promise<boolean> {
//   return await isConcrete(scope, constraint.child)
//     && await isConcreteIterable(scope, constraint.parents)
// }

export async function findImplicitArguments(stateValue: MutableState, expression: Expression): Promise<StateResult<Expression>> {
  const state = State.of(stateValue);

  const resultType = expression.resultType;
  if (resultType) {
    pMap(resultType.constraints, async constraint => {
      if (isConcreteConstraint(state.scope(), constraint)) {

      }

      // The constraint is not concrete
    });
  }


  switch (expression.kind) {
    case ExpressionKind.Lambda:
    case ExpressionKind.Identifier:
    case ExpressionKind.PolymorphicLambda:


      break;

    case ExpressionKind.Application:
      return state.wrap({
        ...expression,
        callee: await state.runAsync(findImplicitArguments, expression.callee),
        parameters: await pMap(expression.parameters, async parameter => (
          parameter ? state.runAsync(findImplicitArguments, parameter) : null
        ))
      });

    case ExpressionKind.List:
      return state.wrap({
        ...expression,
        elements: await pMap(expression.elements, element => (
          state.runAsync(findImplicitArguments, element)
        )),
      });

    case ExpressionKind.NativeLambda:
    case ExpressionKind.Nothing:
    case ExpressionKind.Anything:
    case ExpressionKind.Integer:
    case ExpressionKind.String:
    case ExpressionKind.Boolean:
    case ExpressionKind.Float:
      return state.wrap(expression);

    default:
      return assertNever(expression);
  }
}




export function evaluateExpression(scope: Scope, expression: Expression): LazyValue {
  return async () => {
    switch (expression.kind) {
      case ExpressionKind.Anything:
        return { kind: ValueKind.Anything };

      case ExpressionKind.Nothing:
        return { kind: ValueKind.Nothing };

      case ExpressionKind.Integer:
        return {
          kind: ValueKind.Integer,
          value: expression.value,
        };

      case ExpressionKind.Float:
        return {
          kind: ValueKind.Float,
          value: expression.value,
        };

      case ExpressionKind.Boolean:
        return {
          kind: ValueKind.Boolean,
          value: expression.value,
        };

      case ExpressionKind.String:
        return {
          kind: ValueKind.String,
          value: expression.value,
        };

      case ExpressionKind.List:
        return {
          kind: ValueKind.List,
          values: mapIterator(expression.elements, value => evaluateExpression(scope, value)),
        };

      case ExpressionKind.Lambda:
        return {
          kind: ValueKind.Lambda,
          parameterNames: expression.parameterNames,
          body: evaluateExpression(scope, expression.body),
        };

      case ExpressionKind.Identifier: {
        const value = lookUpDeclaration(scope, expression);
        // If the identifier matches something in the scope, then return the literal, otherwise return
        // an unbound variable
        // TODO, include other kinds of declarations
        return value ? {
          kind: ValueKind.UserDefinedLiteral,
          name: value.name,
        } : unboundVariable(expression.name);
      }

      case ExpressionKind.Application: {
        const callee = await evaluateExpression(scope, expression.callee)();
        switch (callee.kind) {
          case ValueKind.UserDefinedLiteral:
          case ValueKind.UnboundVariable:
          case ValueKind.TypeInterface:
          case ValueKind.Application:
            return {
              callee: makeLazy(callee),
              kind: ValueKind.Application,
              parameters: mapIterator(expression.parameters, parameter => (
                evaluateExpression(scope, parameter)
              )),
            };

          case ValueKind.Anything:
          case ValueKind.Nothing:
          case ValueKind.Integer:
          case ValueKind.Float:
          case ValueKind.String:
          case ValueKind.Boolean:
          case ValueKind.List:
            throw new Error('Cannot call literal value');

          case ValueKind.Lambda: {
            if (expression.parameters.length > callee.parameterNames.length) {
              throw new Error(`Lambda called with too many parameters. Expected ${callee.parameterNames.length}, received ${expression.parameters.length}`);
            }

            // Inline all of the supplied arguments to the body
            const evaluatedBody = expression.parameters
              .map(parameter => evaluateExpression(scope, parameter))
              .reduce(
                (body, parameter, index) => (
                  substituteVariable(body, callee.parameterNames[index], parameter)
                ),
                callee.body,
              );

            // If the exact number of parameters was provided, return the evaluated body, else
            // construct a new lambda that accepts the remaining arguments
            return expression.parameters.length === callee.parameterNames.length
              ? await evaluatedBody()
              : {
                kind: ValueKind.Lambda,
                parameterNames: callee.parameterNames.slice(expression.parameters.length),
                body: evaluatedBody,
              };
          }

          case ValueKind.NativeLambda: {
            if (expression.parameters.length > callee.parameterCount) {
              throw new Error(`Lambda called with too many parameters. Expected ${callee.parameterCount}, received ${expression.parameters.length}`);
            }

            // If the exact number of parameters was provided, call the body, otherwise
            // construct a new native lambda and partially apply its body
            const parameters = expression.parameters.map(parameter => (
              evaluateExpression(scope, parameter)
            ));
            return expression.parameters.length === callee.parameterCount
              ? await callee.body(...parameters)()
              : {
                kind: ValueKind.NativeLambda,
                parameterCount: callee.parameterCount - expression.parameters.length,
                body: (...remainingParameters) => callee.body(...parameters, ...remainingParameters),
              };
          }

          default:
            return assertNever(callee);
        }
      }

      default:
        return assertNever(expression);
    }
  };
}












const emptyConvergeResult: [LazyValue | null, TypeConstraints] = [null, []];

async function pIncludesWith<T>(list: T[], searchValue: T, comparator: (left: T, right: T) => boolean | Promise<boolean>): Promise<boolean> {
  for (let i = 0; i < list.length; i++) {
    if (await comparator(searchValue, list[i])) {
      return true;
    }
  }
  return false;
}

async function pUniqWith<T>(list: Iterable<T>, comparator: (left: T, right: T) => boolean | Promise<boolean>): Promise<Iterable<T>> {
  const result: T[] = [];

  for (const element of list) {
    if (!await pIncludesWith(result, element, comparator)) {
      result.push(element);
    }
  }
  return result;
}

function compactConstraints(constraints: TypeConstraints): Promise<TypeConstraints> {
  return compactArrayWith(
    constraints,
    (left, right) => typeValuesAreEqual(left.child, right.child),
    async (left, right): Promise<TypeConstraint> => {
      const parents = await pUniqWith(
        [...Array.from(left.parents()), ...Array.from(right.parents())],
        typeValuesAreEqual,
      );
      return {
        kind: 'TypeConstraint',
        child: left.child,
        parents: () => parents,
      };
    },
  );
}

async function typeIsReferenced(lazyHaystack: LazyValue, needle: LazyValue): Promise<boolean> {
  if (await typeValuesAreEqual(lazyHaystack, needle)) {
    return true;
  }

  const haystack = await lazyHaystack();
  switch (haystack.kind) {
    case ValueKind.Nothing:
    case ValueKind.Anything:
    case ValueKind.Integer:
    case ValueKind.Float:
    case ValueKind.String:
    case ValueKind.Boolean:
    case ValueKind.NativeLambda:
    case ValueKind.Lambda:
    case ValueKind.UserDefinedLiteral:
    case ValueKind.TypeInterface:
    case ValueKind.UnboundVariable:
      return false;

    case ValueKind.List:
      return pIterateSome(haystack.values(), value => typeIsReferenced(value, needle));

    case ValueKind.Application:
      return typeIsReferenced(haystack.callee, needle)
        || pIterateSome(haystack.parameters(), parameter => typeIsReferenced(parameter, needle));

    default:
      return assertNever(haystack);
  }
}

function filterConstraints(type: LazyValue, constraints: TypeConstraints): Promise<TypeConstraints> {
  return pFilter(constraints, async constraint => (
    await typeIsReferenced(type, constraint.child) || await typeIsReferenced(constraint.child, type)
  ));
}

async function makeConvergeResult(type: LazyValue, constraints: TypeConstraints): Promise<[LazyValue, TypeConstraints]> {
  return [type, await compactConstraints(await filterConstraints(type, constraints))];
}

/**
 * Compares two types and returns the highest common type between them. It is used when an argument
 * is passed to a function to produce the new signature.
 * TODO consider accepting whole types instead of values and constraints
 */
export async function convergeTypeValues(
  stateValue: MutableState,
  lazyLeft: LazyValue,
  leftConstraints: TypeConstraints,
  lazyRight: LazyValue,
  rightConstraints: TypeConstraints,
): Promise<StateResult<[LazyValue | null, TypeConstraints]>> {
  const state = State.of(stateValue);
  const left = await lazyLeft();
  // It is easier to handle Nothing, Anything and UnboundVariables if the are on the left
  if (left.kind !== ValueKind.Nothing) {
    const right = await lazyRight();
    if (right.kind === ValueKind.Nothing) {
      return convergeTypeValues(state.mutableState(), lazyRight, rightConstraints, lazyLeft, leftConstraints);
    }

    if (left.kind !== ValueKind.Anything) {
      if (right.kind === ValueKind.Anything) {
        return convergeTypeValues(state.mutableState(), lazyRight, rightConstraints, lazyLeft, leftConstraints);
      }

      if (left.kind !== ValueKind.UnboundVariable) {
        if (right.kind === ValueKind.UnboundVariable) {
          return convergeTypeValues(state.mutableState(), lazyRight, rightConstraints, lazyLeft, leftConstraints);
        }
      }
    }
  }

  switch (left.kind) {
    case ValueKind.Nothing:
      return state.wrap(await makeConvergeResult(lazyLeft, []));

    case ValueKind.Anything:
      return state.wrap(await makeConvergeResult(lazyRight, rightConstraints));

    case ValueKind.Integer:
    case ValueKind.Float:
    case ValueKind.String:
    case ValueKind.Boolean:
    case ValueKind.List:
    case ValueKind.UserDefinedLiteral:
    case ValueKind.TypeInterface:
      return state.wrap(typeValuesAreEqual(lazyLeft, lazyRight)
        ? await makeConvergeResult(lazyLeft, leftConstraints)
        : emptyConvergeResult);

    case ValueKind.Lambda:
      // TODO
      return state.wrap(emptyConvergeResult);

    case ValueKind.NativeLambda:
      return state.wrap(emptyConvergeResult);

    case ValueKind.UnboundVariable: {
      // Assign the left variable the type of the right in the scope
      state.setScope(assignVariableType(state.scope(), left.name, makeType(lazyRight, rightConstraints)));

      const right = await lazyRight();
      if (right.kind !== ValueKind.UnboundVariable) {
        // Test if the right value satisfies all of the required constraints
        if (
          pEvery(leftConstraints, constraint => (
            satisfiesConstraint(state.scope(), constraint, lazyRight)
          ))
        ) {
          return state.wrap(await makeConvergeResult(lazyRight, rightConstraints));
        }
        return state.wrap(emptyConvergeResult);
      }

      // Return the right type and replace all occurrences of the left type with the right in the
      // constraints
      return state.wrap(await makeConvergeResult(lazyRight, [
        ...rightConstraints,
        ...leftConstraints.map<TypeConstraint>(constraint => ({
          kind: 'TypeConstraint',
          child: substituteVariable(constraint.child, left.name, lazyRight),
          parents: mapIterator(constraint.parents(), parent => substituteVariable(parent, left.name, lazyRight)),
        })),
      ]));
    }

    case ValueKind.Application: {
      const right = await lazyRight();
      if (right.kind !== ValueKind.Application || right.parameters.length !== left.parameters.length) {
        return state.wrap(emptyConvergeResult);
      }

      const [callee, calleeConstraints] = await state.runAsync(
        convergeTypeValues,
        left.callee,
        leftConstraints,
        right.callee,
        rightConstraints,
      );
      if (!callee) {
        return state.wrap(emptyConvergeResult);
      }

      const mergedParameters = mapIterator(
        left.parameters(),
        ((leftParameter, index) => state.runAsync(
          convergeTypeValues,
          leftParameter,
          leftConstraints,
          right.parameters[index],
          rightConstraints,
        )),
      );
      if (pIterateSome(mergedParameters(), async (result) => (await result)[0] === null)) {
        return state.wrap(emptyConvergeResult);
      }

      const result: Application = {
        callee,
        kind: ValueKind.Application,
        parameters: mapIterator(mergedParameters(), (result) => async () => (await result[0])),
      };
      const resultConstraints = [
        ...calleeConstraints,
        ...([] as any[]).concat(...Array.from(await Promise.all(mapIterator(mergedParameters(), async (result) => await result[1])()))),
      ];
      return state.wrap(await makeConvergeResult(makeLazy(result), resultConstraints));
    }

    default:
      return assertNever(left);
  }
}

