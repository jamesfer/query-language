import { assign, mapValues } from 'lodash';
import { Expression, ExpressionKind } from './compiler/expression';
import { type, Type, TypeConstraints, TypeImplementation } from './compiler/type/type';
import { UniversalScope, UniversalScopeVariableEntry } from './compiler/universal-scope';
import { LazyValue, NativeLambdaBody } from './compiler/value';
import { lazyValue, record } from './compiler/value-constructors';
import { evaluateExpression2 } from './compiler/evaluate-expression';

export interface LibraryLambda {
  type: Type;
  parameterNames: string[];
  body: Expression;
}

export interface NativeLibraryLambda {
  type: Type;
  parameterCount: number;
  body: NativeLambdaBody;
}

export interface LibraryImplementation {
  parent: LazyValue;
  child: LazyValue;
  constraints?: TypeConstraints;
  values: {
    [k: string]: Expression;
  };
}

export interface Library {
  lambdas?: {
    [name: string]: LibraryLambda;
  };
  nativeLambdas?: {
    [name: string]: NativeLibraryLambda;
  };
  implementations?: {
    [name: string]: LibraryImplementation;
  };
}

export function mergeLibraries(...libraries: Library[]): Library {
  return {
    nativeLambdas: assign({}, ...libraries.map(({ nativeLambdas }) => nativeLambdas)),
    implementations: assign({}, ...libraries.map(({ implementations }) => implementations)),
    lambdas: assign({}, ...libraries.map(({ lambdas }) => lambdas)),
  };
}

export function convertToScope(library: Library): UniversalScope {
  return {
    implementations: mapValues(library.implementations, (implementation): TypeImplementation => ({
      kind: 'TypeImplementation',
      childType: implementation.child,
      parentType: implementation.parent,
      constraints: implementation.constraints || [],
      values: implementation.values,
    })),
    variables: {
      ...mapValues(library.implementations, (implementation): UniversalScopeVariableEntry => {
        const resultType = type(lazyValue(record(mapValues(implementation.values, value => async () => (await evaluateExpression2({}, value, [], []))()))));
        return {
          valueType: resultType,
          value: {
            resultType,
            kind: ExpressionKind.Record,
            implicitParameters: [],
            tokens: [],
            properties: implementation.values,
          },
        };
      }),
      ...mapValues(library.lambdas, (lambda): UniversalScopeVariableEntry => ({
        valueType: lambda.type,
        value: {
          kind: ExpressionKind.Lambda,
          implicitParameters: [],
          tokens: [],
          parameterNames: lambda.parameterNames,
          resultType: lambda.type,
          body: lambda.body,
        },
      })),
      ...mapValues(library.nativeLambdas, (native): UniversalScopeVariableEntry => ({
        valueType: native.type,
        value: {
          kind: ExpressionKind.NativeLambda,
          implicitParameters: [],
          tokens: [],
          parameterCount: native.parameterCount,
          resultType: native.type,
          body: native.body,
        },
      })),
    },
  };
}
