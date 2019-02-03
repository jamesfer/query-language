import { isInteger, once, uniqWith } from 'lodash';
import { assertNever } from '../utils';

/**
 * Values
 */

export interface Anything {
  kind: 'Anything';
}

export interface Nothing {
  kind: 'Nothing';
}

export interface UserDefinedLiteral {
  kind: 'UserDefinedLiteral';
  name: string;
}

export interface TypeInterface {
  kind: 'TypeInterface';
  name: string;
}

export interface UnboundVariable {
  kind: 'UnboundVariable';
  name: string;
}

export interface Lambda {
  kind: 'Lambda';
  parameterNames: string[];
  body: LazyValue;
}

export interface NativeLambda {
  kind: 'NativeLambda';
  parameterCount: number;
  body: (...parameters: LazyValue[]) => LazyValue;
}

export interface Application {
  kind: 'Application';
  callee: LazyValue;
  parameters: LazyValueList;
}

export interface Integer {
  kind: 'Integer';
  value: number;
}

export interface Float {
  kind: 'Float';
  value: number;
}

export interface String {
  kind: 'String';
  value: string;
}

export interface Boolean {
  kind: 'Boolean';
  value: boolean;
}

export interface List {
  kind: 'List';
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

export type LazyValue = () => Promise<Value>;

export type LazyValueList = () => Iterable<LazyValue>;





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
  constraints: TypeConstraints
}

export interface TypeScope {
  // List of implementations of an interface type
  implementations: TypeImplementation[];

  // List of subtype relationships between types
  subtypeRelationships: SubtypeRelationship[];

  // Map of all type declarations
  // This is used to look up the value of an identifier
  declarations: { [k: string]: TypeDeclaration };
}





export interface ApplicationExpression {
  kind: 'ApplicationExpression';
  callee: Expression;
  parameters: Expression[];
}

export interface IdentifierExpression {
  kind: 'IdentifierExpression';
  name: string;
}

export interface LambdaExpression {
  kind: 'LambdaExpression';
  parameterNames: string[];
  body: Expression;
}

export interface NumberExpression {
  kind: 'NumberExpression';
  value: number;
}

export interface StringExpression {
  kind: 'StringExpression';
  value: string;
}

export interface BooleanExpression {
  kind: 'BooleanExpression';
  value: boolean;
}

export interface ListExpression {
  kind: 'ListExpression';
  values: Expression[];
}

export type Expression =
  | Anything
  | Nothing
  | ApplicationExpression
  | IdentifierExpression
  | LambdaExpression
  | StringExpression
  | NumberExpression
  | BooleanExpression
  | ListExpression;





export interface UserDefinedLiteralDeclaration {
  kind: 'UserDefinedLiteralDeclaration';
  name: string;
  parameterNames: string;
}

export interface LambdaDeclaration {
  kind: 'LambdaDeclaration';
  name: string;
  parameterNames: string;
  body: Expression;
}

export type TypeDeclaration =
  | UserDefinedLiteralDeclaration
  | LambdaDeclaration;

export function lookUpDeclaration(
  scope: TypeScope,
  variable: IdentifierExpression,
): TypeDeclaration | undefined {
  return scope.declarations[variable.name];
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

function compactArrayWith<T>(
  array: T[],
  canCompact: (left: T, right: T) => boolean,
  compact: (left: T, right: T) => T,
): T[] {
  const result: T[] = [];
  let remaining = [...array];
  let current = remaining.pop();
  while (current) {
    let index = 0;
    while (index < remaining.length) {
      if (canCompact(current, remaining[index])) {
        current = compact(current, remaining[index]);
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

async function* asyncMap<T, U>(
  iterable: AsyncIterable<T>,
  iteratee: (item: T, index: number) => U | Promise<U>,
): AsyncIterable<U> {
  let index = 0;
  for await (const item of iterable) {
    yield iteratee(item, index);
    index++;
  }
}

function mapIterator<T, U>(
  iterable: Iterable<T>,
  iteratee: (item: T, index: number) => U,
): () => Iterable<U> {
  return function* () {
    let index = 0;
    for (const item of iterable) {
      yield iteratee(item, index);
      index++;
    }
  }
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






function substituteVariable(
  lazyType: LazyValue,
  name: string,
  lazyValue: LazyValue,
): LazyValue {
  return once(() => lazyType().then(async (type): Promise<Value> => {
    switch (type.kind) {
      case 'Anything':
      case 'Nothing':
      case 'Integer':
      case 'Float':
      case 'String':
      case 'Boolean':
      case 'UserDefinedLiteral':
      case 'TypeInterface':
      case 'NativeLambda':
        return type;

      case 'UnboundVariable':
        return type.name === name ? lazyValue() : type;

      case 'List':
        return {
          ...type,
          values: mapIterator(type.values(), element => (
            substituteVariable(element, name, lazyValue)
          )),
        };

      case 'Lambda':
        return type.parameterNames.includes(name) ? type : {
          kind: 'Lambda',
          parameterNames: type.parameterNames,
          body: substituteVariable(type.body, name, lazyValue),
        };

      case 'Application':
        return {
          kind: 'Application',
          callee: substituteVariable(type.callee, name, lazyValue),
          parameters: mapIterator(type.parameters(), parameter => (
            substituteVariable(parameter, name, lazyValue)
          )),
        };

      default:
        return assertNever(type);
    }
  }));
}

// async function substituteAsyncVariable(
//   type: LazyValue,
//   name: string,
//   value: LazyValue,
// ) {
//   return substituteVariable(await type(), name, value);
// }

async function typeValuesAreEqual(lazyLeft: LazyValue, lazyRight: LazyValue): Promise<boolean> {
  const left = await lazyLeft();
  const right = await lazyRight();

  switch (left.kind) {
    case 'Anything':
    case 'Nothing':
      return right.kind === left.kind;

    case 'Integer':
    case 'Float':
    case 'String':
    case 'Boolean':
      return right.kind === left.kind && right.value === left.value;

    case 'UnboundVariable':
    case 'UserDefinedLiteral':
    case 'TypeInterface':
      return right.kind === left.kind && right.name === left.name;

    case 'NativeLambda':
      return right.kind === 'NativeLambda' && right.body === left.body;

    case 'List':
      return right.kind === 'List' &&
        await iteratorsEqual(right.values(), left.values(), typeValuesAreEqual);

    case 'Lambda':
      return right.kind === 'Lambda'
        && arraysAreEqual(right.parameterNames, left.parameterNames)
        && typeValuesAreEqual(left.body, right.body);

    case 'Application':
      return right.kind === 'Application'
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
      case 'Anything':
        break;

      case 'Nothing':
      case 'Integer':
      case 'Float':
      case 'String':
      case 'Boolean':
      case 'List':
      case 'NativeLambda':
        return false;

      case 'UnboundVariable':
        // TODO is this really the correct response
        break;

      case 'UserDefinedLiteral': {
        // Find a subtype relationship defined for this literal
        const relationExists = await pSome(scope.subtypeRelationships, async (relationship) => {
          const childMatches = typeValuesAreEqual(async () => relationship.child, type);
          const parentMatches = typeValuesAreEqual(async () => relationship.parent, async () => parent);
          const [childExists, parentExists] = await Promise.all([childMatches, parentMatches]);
          return childExists && parentExists;
        });
        if (!relationExists) {
          return false;
        }
        break;
      }

      case 'TypeInterface': {
        // Find an implementation is defined for this interface
        const implementationExists = await pSome(scope.implementations, async (implementation) => {
          const childMatches = typeValuesAreEqual(implementation.childType, type);
          const parentMatches = typeValuesAreEqual(implementation.parentType, async () => parent);
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

      case 'Lambda':
        // TODO this should check that the child is also a function
        return false;

      case 'Application':
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
  if (type.kind === 'Anything') {
    return true;
  }
  if (type.kind === 'Nothing') {
    return false;
  }
  if (type.kind === 'UnboundVariable') {
    return pEvery(typeConstraints, constraint => (
      satisfiesConstraint(scope, constraint, lazySubtype)
    ));
  }

  const subtype = await lazySubtype();
  switch (type.kind) {
    case 'Integer':
    case 'Float':
    case 'String':
    case 'Boolean':
      return subtype.kind === type.kind
        && subtype.value === type.value;

    case 'UserDefinedLiteral':
    case 'TypeInterface':
      return subtype.kind === type.kind
        && subtype.name === type.name;

    case 'List':
      return subtype.kind === 'List'
        && iteratorsEqual(subtype.values(), type.values(), (subValue, typeValue) => (
          isSubtypeUnit(scope, typeValue, subValue, typeConstraints, subtypeConstraints)
        ));

    case 'Lambda':
      return subtype.kind === 'Lambda'
        && arraysAreEqual(subtype.parameterNames, type.parameterNames);

    case 'NativeLambda':
      return subtype.kind === 'NativeLambda'
        && subtype.body === type.body;

    case 'Application':
      return subtype.kind === 'Application'
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

export function evaluateExpression(scope: TypeScope, expression: Expression): LazyValue {
  return async () => {
    switch (expression.kind) {
      case 'Anything':
      case 'Nothing':
        return expression;

      case 'NumberExpression':
        return isInteger(expression.value) ? {
          kind: 'Integer',
          value: expression.value,
        } : {
          kind: 'Float',
          value: expression.value,
        };

      case 'BooleanExpression':
        return {
          kind: 'Boolean',
          value: expression.value,
        };

      case 'StringExpression':
        return {
          kind: 'String',
          value: expression.value,
        };

      case 'ListExpression':
        return {
          kind: 'List',
          values: mapIterator(expression.values, value => evaluateExpression(scope, value)),
        };

      case 'LambdaExpression':
        return {
          kind: 'Lambda',
          parameterNames: expression.parameterNames,
          body: evaluateExpression(scope, expression.body),
        };

      case 'IdentifierExpression': {
        const value = lookUpDeclaration(scope, expression);
        // If the identifier matches something in the scope, then return the literal, otherwise return
        // an unbound variable
        // TODO, include other kinds of declarations
        return value ? {
          kind: 'UserDefinedLiteral',
          name: value.name,
        } : {
          kind: 'UnboundVariable',
          name: expression.name,
        };
      }

      case 'ApplicationExpression': {
        const callee = await evaluateExpression(scope, expression.callee)();
        switch (callee.kind) {
          case 'UserDefinedLiteral':
          case 'UnboundVariable':
          case 'TypeInterface':
          case 'Application':
            return {
              callee: async () => callee,
              kind: 'Application',
              parameters: mapIterator(expression.parameters, parameter => (
                evaluateExpression(scope, parameter)
              )),
            };

          case 'Anything':
          case 'Nothing':
          case 'Integer':
          case 'Float':
          case 'String':
          case 'Boolean':
          case 'List':
            throw new Error('Cannot call literal value');

          case 'Lambda': {
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
                kind: 'Lambda',
                parameterNames: callee.parameterNames.slice(expression.parameters.length),
                body: evaluatedBody,
              };
          }

          case 'NativeLambda': {
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
                kind: 'NativeLambda',
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

function compactConstraints(constraints: TypeConstraints): TypeConstraints {
  return compactArrayWith(
    constraints,
    (left, right) => typeValuesAreEqual(left.child, right.child),
    (left, right): TypeConstraint => ({
      kind: 'TypeConstraint',
      child: left.child,
      parents: uniqWith([...left.parents, ...right.parents], typeValuesAreEqual),
    }),
  );
}

function typeIsReferenced(haystack: LazyValue, needle: LazyValue): boolean {
  if (typeValuesAreEqual(haystack, needle)) {
    return true;
  }

  switch (haystack.kind) {
    case 'Nothing':
    case 'Anything':
    case 'Integer':
    case 'Float':
    case 'String':
    case 'Boolean':
    case 'NativeLambda':
    case 'Lambda':
    case 'UserDefinedLiteral':
    case 'TypeInterface':
    case 'UnboundVariable':
      return false;

    case 'List':
      return haystack.values.some(value => typeIsReferenced(value, needle));

    case 'Application':
      return typeIsReferenced(haystack.callee, needle)
        || haystack.parameters.some(parameter => typeIsReferenced(parameter, needle));

    default:
      return assertNever(haystack);
  }
}

function filterConstraints(type: LazyValue, constraints: TypeConstraints): TypeConstraints {
  return constraints.filter(constraint => (
    typeIsReferenced(type, constraint.child) || typeIsReferenced(constraint.child, type)
  ));
}

function makeConvergeResult(type: LazyValue, constraints: TypeConstraints): [LazyValue, TypeConstraints] {
  return [type, compactConstraints(filterConstraints(type, constraints))];
}

/**
 * Compares two types and returns the highest common type between them. It is used when an argument
 * is passed to a function to produce the new signature.
 */
export function convergeTypeValues(
  scope: TypeScope,
  left: LazyValue,
  leftConstraints: TypeConstraints,
  right: LazyValue,
  rightConstraints: TypeConstraints,
): [LazyValue | null, TypeConstraints] {
  // It is easier to handle Nothing, Anything and UnboundVariables if the are on the left
  if (left.kind !== 'Nothing') {
    if (right.kind === 'Nothing') {
      return convergeTypeValues(scope, right, rightConstraints, left, leftConstraints);
    }

    if (left.kind !== 'Anything') {
      if (right.kind === 'Anything') {
        return convergeTypeValues(scope, right, rightConstraints, left, leftConstraints);
      }

      if (left.kind !== 'UnboundVariable') {
        if (right.kind === 'UnboundVariable') {
          return convergeTypeValues(scope, right, rightConstraints, left, leftConstraints);
        }
      }
    }
  }

  switch (left.kind) {
    case 'Nothing':
      return [left, []];

    case 'Anything':
      return makeConvergeResult(right, rightConstraints);

    case 'Integer':
    case 'Float':
    case 'String':
    case 'Boolean':
    case 'List':
    case 'UserDefinedLiteral':
    case 'TypeInterface':
      return typeValuesAreEqual(left, right)
        ? makeConvergeResult(left, leftConstraints)
        : emptyConvergeResult;

    case 'Lambda':
      // TODO
      return emptyConvergeResult;

    case 'NativeLambda':
      return emptyConvergeResult;

    case 'UnboundVariable':
      if (right.kind !== 'UnboundVariable') {
        // Test if the right value satisfies all of the required constraints
        if (leftConstraints.every(constraint => satisfiesConstraint(scope, constraint, right))) {
          return makeConvergeResult(right, rightConstraints);
        }
        return emptyConvergeResult;
      }

      // Return the right type and replace all occurrences of the left type with the right in the
      // constraints
      return makeConvergeResult(right, [
        ...rightConstraints,
        ...leftConstraints.map<TypeConstraint>(constraint => ({
          kind: 'TypeConstraint',
          child: substituteVariable(constraint.child, left.name, right),
          parents: constraint.parents.map(parent => substituteVariable(parent, left.name, right)),
        })),
      ]);

    case 'Application': {
      if (right.kind !== 'Application' || right.parameters.length !== left.parameters.length) {
        return emptyConvergeResult;
      }

      const [callee, calleeConstraints] = convergeTypeValues(
        scope,
        left.callee,
        leftConstraints,
        right.callee,
        rightConstraints,
      );
      if (!callee) {
        return emptyConvergeResult;
      }

      const mergedParameters = left.parameters.map((leftParameter, index) => convergeTypeValues(
        scope,
        leftParameter,
        leftConstraints,
        right.parameters[index],
        rightConstraints,
      ));
      if (mergedParameters.some(([parameter]) => parameter === null)) {
        return emptyConvergeResult;
      }

      const result: Application = {
        callee,
        kind: 'Application',
        parameters: mergedParameters.map(([parameter]) => parameter as LazyValue),
      };
      const resultConstraints = [
        ...calleeConstraints,
        ...([] as any[]).concat(...mergedParameters.map(([, constraints]) => constraints)),
      ];
      return makeConvergeResult(result, resultConstraints);
    }

    default:
      return assertNever(left);
  }
}

