import { identifierToken } from '../../../tests/utils';
import {
  UntypedExpression,
  UntypedFunctionCallExpression,
  UntypedFunctionExpression,
} from '../../untyped-expression';
import {
  ApplicationExpression,
  ExpressionKind,
  LambdaExpression,
  ListExpression,
} from '../expression';
import { TypeScope } from '../scope';
import { LazyValue, Value } from '../value';
import {
  booleanType,
  floatType,
  functionType,
  integerType,
  lazyValue,
  listType,
  nothing,
  stringType,
  unboundVariable,
  boundVariable, userDefinedLiteral,
} from '../value-constructors';
import { serializeType } from './test-utils';
import { type, TypeConstraint, TypeConstraints } from './type';
import { typeExpression } from './type-expression';
import { State } from './state';

describe('typeExpression', () => {
  const emptyScope: TypeScope = {};

  describe('with simple literal expressions', () => {
    const simpleExpressions: [string, Value, UntypedExpression][] = [
      ['Boolean', booleanType, {
        kind: 'Boolean',
        tokens: [],
        value: true,
      }],
      ['String', stringType, {
        kind: 'String',
        tokens: [],
        value: '',
      }],
      ['Float', floatType, {
        kind: 'Float',
        tokens: [],
        value: 1.1,
      }],
      ['Integer', integerType, {
        kind: 'Integer',
        tokens: [],
        value: 1,
      }],
      ['Nothing', nothing, {
        kind: 'None',
        tokens: [],
      }],
    ];
    it.each(simpleExpressions)(
      'converts untyped %s expression to a typed one',
      async (kind, _, untypedExpression) => {
        const [, , expression] = await typeExpression(emptyScope, untypedExpression);
        expect(expression).toEqual({
          ...untypedExpression,
          kind: ExpressionKind[kind],
          resultType: type(expect.any(Function) as any),
          implicitParameters: [],
        });
      },
    );

    it.each(simpleExpressions)(
      'types a %s expression correctly',
      async (kind, resultValue, untypedExpression) => {
        const [, , expression] = await typeExpression(emptyScope, untypedExpression);
        expect(await expression.resultType.value()).toEqual(resultValue);
      },
    );
  });

  describe('with an identifier expression', () => {
    it('looks up the type in the scope', async () => {
      let valueType = type(lazyValue(integerType));
      const scopeWithIdentifier: TypeScope = {
        variables: {
          name: { valueType },
        },
      };
      const [, , { resultType }] = await typeExpression(
        scopeWithIdentifier,
        {
          kind: 'Identifier',
          tokens: [],
          value: 'name',
        },
      );

      expect(await serializeType(resultType)).toEqual(
        await serializeType(valueType)
      );
    });
  });

  describe('with an array expression', () => {
    describe('with simple elements', () => {
      const elements: UntypedExpression[] = [
        {
          kind: 'Integer',
          tokens: [],
          value: 1,
        },
        {
          kind: 'Integer',
          tokens: [],
          value: 2,
        },
      ];
      const untypedExpression: UntypedExpression = {
        elements,
        kind: 'Array',
        tokens: [],
      };

      it('returns a typed expression', async () => {
        const [, , expression] = await typeExpression(emptyScope, untypedExpression);
        expect(expression).toEqual({
          kind: ExpressionKind.List,
          tokens: [],
          elements: expect.any(Array),
          resultType: expect.any(Object),
          implicitParameters: [],
        });
      });

      it('types the expression as an array of integers', async () => {
        const [, , { resultType }] = await typeExpression(emptyScope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(lazyValue(listType(lazyValue(integerType))))
        ));
      });
    });

    describe('with no elements', () => {
      const untypedExpression: UntypedExpression = {
        kind: 'Array',
        elements: [],
        tokens: [],
      };

      it('types the expression as an unbound type', async () => {
        const [, , { resultType }] = await typeExpression(emptyScope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(lazyValue(listType(lazyValue(unboundVariable('T')))))
        ));
      });
    });

    describe('where one element is an unbound variable', () => {
      const scope: TypeScope = {
        variables: {
          T: { valueType: type(lazyValue(unboundVariable('T'))) },
        },
      };
      const elements: UntypedExpression[] = [
        {
          kind: 'Identifier',
          tokens: [],
          value: 'T',
        },
        {
          kind: 'Integer',
          tokens: [],
          value: 2,
        },
      ];
      const untypedExpression: UntypedExpression = {
        elements,
        kind: 'Array',
        tokens: [],
      };

      it('types the list elements as the concrete type', async () => {
        const [, , { resultType }] = await typeExpression(scope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(lazyValue(listType(lazyValue(integerType))))
        ));
      });
    });

    describe('where two elements have the same variable in their types', () => {
      it('converges the types', async () => {
        const scope: TypeScope = {
          variables: {
            x: {
              valueType: type(functionType(
                lazyValue(unboundVariable('a')),
                lazyValue(unboundVariable('b')),
              )),
            },
            y: {
              valueType: type(functionType(
                lazyValue(unboundVariable('b')),
                lazyValue(unboundVariable('a')),
              )),
            }
          }
        };
        const elements: UntypedExpression[] = [
          {
            kind: 'Identifier',
            tokens: [],
            value: 'x',
          },
          {
            kind: 'Identifier',
            tokens: [],
            value: 'y',
          },
        ];
        const untypedExpression: UntypedExpression = {
          elements,
          kind: 'Array',
          tokens: [],
        };
        const { resultType } = State.unwrap(await typeExpression(scope, untypedExpression));
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(lazyValue(listType(functionType(
            lazyValue(unboundVariable('b')),
            lazyValue(unboundVariable('a')),
          ))))
        ));
      });
    });

    describe('when an element has constraints', () => {
      it('fulfills constraints that can be resolved', async () => {
        const constraint: TypeConstraint = {
          kind: 'TypeConstraint',
          parent: lazyValue(userDefinedLiteral('Monad')),
          child: lazyValue(integerType),
        };
        const scope: TypeScope = {
          variables: {
            x: {
              valueType: type(
                functionType(
                  lazyValue(integerType),
                  lazyValue(unboundVariable('b')),
                ),
                [constraint],
              ),
            },
          },
          implementations: {
            monadInteger: {
              kind: 'TypeImplementation',
              childType: lazyValue(integerType),
              parentType: lazyValue(userDefinedLiteral('Monad')),
              constraints: [],
              values: {},
            },
          },
        };
        const elements: UntypedExpression[] = [
          {
            kind: 'Identifier',
            tokens: [],
            value: 'x',
          },
        ];
        const untypedExpression: UntypedExpression = {
          elements,
          kind: 'Array',
          tokens: [],
        };
        const { resultType, elements: [{ implicitParameters }] } = State.unwrap(await typeExpression(scope, untypedExpression)) as ListExpression;
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(
            lazyValue(listType(functionType(
              lazyValue(integerType),
              lazyValue(unboundVariable('b')),
            ))),
          )
        ));
        expect(implicitParameters).toEqual(['monadInteger']);
      });

      it('lifts constraints that cannot be resolved', async () => {
        const constraint: TypeConstraint = {
          kind: 'TypeConstraint',
          parent: lazyValue(userDefinedLiteral('Monad')),
          child: lazyValue(unboundVariable('a')),
        };
        const scope: TypeScope = {
          variables: {
            x: {
              valueType: type(
                functionType(
                  lazyValue(unboundVariable('a')),
                  lazyValue(unboundVariable('b')),
                ),
                [constraint],
              ),
            },
          }
        };
        const elements: UntypedExpression[] = [
          {
            kind: 'Identifier',
            tokens: [],
            value: 'x',
          },
        ];
        const untypedExpression: UntypedExpression = {
          elements,
          kind: 'Array',
          tokens: [],
        };
        const { resultType } = State.unwrap(await typeExpression(scope, untypedExpression));
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(
            lazyValue(listType(functionType(
              lazyValue(unboundVariable('a')),
              lazyValue(unboundVariable('b')),
            ))),
            [constraint],
          )
        ));
      });
    });
  });

  describe('with a function expression', () => {
    describe('with no parameters', () => {
      const untypedExpression: UntypedFunctionExpression = {
        kind: 'Function',
        tokens: [],
        arguments: [],
        value: {
          kind: 'Integer',
          tokens: [],
          value: 1,
        },
      };

      it('converts the untyped expression to a typed one', async () => {
        const expectedExpression: LambdaExpression = {
          kind: ExpressionKind.Lambda,
          tokens: [],
          parameterNames: [],
          implicitParameters: [],
          resultType: expect.any(Object),
          body: {
            kind: ExpressionKind.Integer,
            tokens: [],
            value: 1,
            implicitParameters: [],
            resultType: expect.any(Object),
          },
        };
        const [, , actualExpression] = await typeExpression(emptyScope, untypedExpression);
        expect(actualExpression).toEqual(expectedExpression);
      });

      it('types the expression based on the body', async () => {
        const [, , { resultType }] = await typeExpression(emptyScope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(functionType(lazyValue(integerType)))
        ));
      });
    });

    describe('with parameters', () => {
      it('types the return value in terms of the parameters', async () => {
        const untypedExpression: UntypedFunctionExpression = {
          kind: 'Function',
          tokens: [],
          arguments: [identifierToken('a')],
          value: {
            kind: 'Identifier',
            tokens: [],
            value: 'a',
          },
        };
        const [, , { resultType }] = await typeExpression(emptyScope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(functionType(lazyValue(boundVariable('aT0')), lazyValue(boundVariable('aT0'))))
        ));
      });

      it('infers the type of the arguments based on their usage in the body', async () => {
        const untypedExpression: UntypedFunctionExpression = {
          kind: 'Function',
          tokens: [],
          arguments: [identifierToken('a')],
          value: {
            kind: 'Array',
            tokens: [],
            elements: [
              {
                kind: 'Identifier',
                tokens: [],
                value: 'a',
              },
              {
                kind: 'Integer',
                tokens: [],
                value: 1,
              },
            ],
          },
        };
        const [, , { resultType }] = await typeExpression(emptyScope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(functionType(
            lazyValue(integerType),
            lazyValue(listType(lazyValue(integerType))),
          )),
        ));
      });
    });
  });

  describe('with a function call expression', () => {
    describe('with no arguments', () => {
      const untypedExpression: UntypedFunctionCallExpression = {
        kind: 'FunctionCall',
        tokens: [],
        args: [],
        functionExpression: {
          kind: 'Function',
          tokens: [],
          arguments: [],
          value: {
            kind: 'Integer',
            tokens: [],
            value: 1,
          },
        },
      };

      it('converts an untyped expression to a typed one', async () => {
        const expectedExpression: ApplicationExpression = {
          kind: ExpressionKind.Application,
          tokens: [],
          implicitParameters: [],
          resultType: expect.any(Object),
          parameters: [],
          callee: {
            kind: ExpressionKind.Lambda,
            tokens: [],
            implicitParameters: [],
            resultType: expect.any(Object),
            parameterNames: [],
            body: {
              kind: ExpressionKind.Integer,
              tokens: [],
              value: 1,
              implicitParameters: [],
              resultType: expect.any(Object),
            },
          },
        };
        const [, , actualExpression] = await typeExpression(emptyScope, untypedExpression);
        expect(actualExpression).toEqual(expectedExpression);
      });

      it('types the expression based on the function body', async () => {
        const [, , { resultType }] = await typeExpression(emptyScope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(
          await serializeType(type(lazyValue(integerType)))
        );
      });
    });

    describe('with parameters', () => {
      const untypedExpression: UntypedFunctionCallExpression = {
        kind: 'FunctionCall',
        tokens: [],
        args: [
          {
            kind: 'Integer',
            tokens: [],
            value: 1,
          },
          {
            kind: 'String',
            tokens: [],
            value: 'Hello',
          },
        ],
        functionExpression: {
          kind: 'Function',
          tokens: [],
          arguments: [identifierToken('a'), identifierToken('b')],
          value: {
            kind: 'Integer',
            tokens: [],
            value: 1,
          },
        },
      };

      it('types the expression based on the function body', async () => {
        const [, , { resultType }] = await typeExpression(emptyScope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(
          await serializeType(type(lazyValue(integerType)))
        );
      });

      it('types the expression as a function when only some parameters are supplied', async () => {
        const partialUntypedExpression: UntypedFunctionCallExpression = {
          ...untypedExpression,
          args: [],
        };
        const [, , { resultType }] = await typeExpression(emptyScope, partialUntypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(functionType(
            lazyValue(boundVariable('aT0')),
            lazyValue(boundVariable('bT0')),
            lazyValue(integerType),
          )),
        ));
      });

      it('types the remaining arguments based on information from the first few', async () => {
        const scope: TypeScope = {
          variables: {
            add: {
              valueType: type(functionType(
                lazyValue(unboundVariable('a')),
                lazyValue(unboundVariable('a')),
                lazyValue(integerType),
              )),
            },
          },
        };
        const partialUntypedExpression: UntypedFunctionCallExpression = {
          ...untypedExpression,
          args: [
            {
              kind: 'Integer',
              tokens: [],
              value: 1,
            },
          ],
          functionExpression: {
            kind: 'Identifier',
            tokens: [],
            value: 'add',
          },
        };
        const [, , { resultType }] = await typeExpression(scope, partialUntypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(functionType(
            lazyValue(integerType),
            lazyValue(integerType),
          )),
        ));
      });

      it('types the return value based on information from the arguments', async () => {
        const scope: TypeScope = {
          variables: {
            increment: {
              valueType: type(functionType(
                lazyValue(unboundVariable('a')),
                lazyValue(unboundVariable('a')),
              )),
            },
          },
        };
        const partialUntypedExpression: UntypedFunctionCallExpression = {
          ...untypedExpression,
          functionExpression: {
            kind: 'Identifier',
            tokens: [],
            value: 'increment',
          },
          args: [
            {
              kind: 'Integer',
              tokens: [],
              value: 1,
            }
          ],
        };
        const { resultType } = State.unwrap(await typeExpression(scope, partialUntypedExpression));
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(lazyValue(integerType)),
        ));
      });

      it('uses a function call to infer bound variables', async () => {
        const scope: TypeScope = {
          variables: {
            inc: { valueType: type(functionType(lazyValue(integerType), lazyValue(integerType))) }
          },
        };
        const untypedExpression: UntypedFunctionExpression = {
          kind: 'Function',
          tokens: [],
          arguments: [identifierToken('a')],
          value: {
            kind: 'FunctionCall',
            tokens: [],
            functionExpression: {
              kind: 'Identifier',
              tokens: [],
              value: 'inc',
            },
            args: [
              {
                kind: 'Identifier',
                tokens: [],
                value: 'a',
              },
            ],
          },
        };
        const [, , { resultType }] = await typeExpression(scope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(functionType(lazyValue(integerType), lazyValue(integerType))),
        ));
      });

      it('can use inferred variables in later parameters', async () => {
        const scope: TypeScope = {
          variables: {
            something: {
              valueType: type(functionType(
                lazyValue(integerType),
                lazyValue(unboundVariable('a')),
                lazyValue(unboundVariable('a')),
              )),
            },
          },
        };
        const untypedExpression: UntypedFunctionExpression = {
          kind: 'Function',
          tokens: [],
          arguments: [identifierToken('a')],
          value: {
            kind: 'FunctionCall',
            tokens: [],
            functionExpression: {
              kind: 'Identifier',
              tokens: [],
              value: 'something',
            },
            args: [
              {
                kind: 'Identifier',
                tokens: [],
                value: 'a',
              },
              {
                kind: 'Identifier',
                tokens: [],
                value: 'a',
              },
            ],
          },
        };
        const [, , { resultType }] = await typeExpression(scope, untypedExpression);
        expect(await serializeType(resultType)).toEqual(await serializeType(
          type(functionType(lazyValue(integerType), lazyValue(integerType))),
        ));
      });
    });
  });
});
