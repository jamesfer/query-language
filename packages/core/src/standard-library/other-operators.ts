import { ExpressionKind } from '../compiler/expression';
import { type } from '../compiler/type/type';
import { functionType, lazyValue, unboundVariable } from '../compiler/value-constructors';
import { Library, LibraryLambda } from '../library';

const compose: LibraryLambda = {
  type: type(functionType(
    functionType(lazyValue(unboundVariable('T2')), lazyValue(unboundVariable('R'))),
    functionType(lazyValue(unboundVariable('T1')), lazyValue(unboundVariable('T2'))),
    functionType(lazyValue(unboundVariable('T1')), lazyValue(unboundVariable('R'))),
  )),
  parameterNames: ['f', 'g'],
  body: {
    kind: ExpressionKind.Lambda,
    tokens: [],
    parameterNames: ['a'],
    resultType: type(functionType(
      lazyValue(unboundVariable('T1')),
      lazyValue(unboundVariable('R')),
    )),
    body: {
      kind: ExpressionKind.Application,
      tokens: [],
      resultType: type(lazyValue(unboundVariable('R'))),
      callee: {
        kind: ExpressionKind.Identifier,
        tokens: [],
        name: 'f',
        resultType: type(functionType(
          lazyValue(unboundVariable('T2')),
          lazyValue(unboundVariable('R')),
        )),
      },
      parameters: [{
        kind: ExpressionKind.Application,
        tokens: [],
        resultType: type(lazyValue(unboundVariable('T2'))),
        callee: {
          kind: ExpressionKind.Identifier,
          tokens: [],
          name: 'g',
          resultType: type(functionType(
            lazyValue(unboundVariable('T1')),
            lazyValue(unboundVariable('T2')),
          )),
        },
        parameters: [{
          kind: ExpressionKind.Identifier,
          tokens: [],
          resultType: type(lazyValue(unboundVariable('T1'))),
          name: 'a',
        }],
      }],
    },
  },
};

export const otherOperators: Library = {
  lambdas: {
    '&': compose,
  },
};
