import { execute } from './api';
import { ExpressionKind, NativeLambdaExpression } from './compiler/expression';
import { type } from './compiler/type/type';
import { Integer, LazyValue } from './compiler/value';
import {
  float,
  functionType,
  integer,
  integerType,
  lazyValue,
  string,
} from './compiler/value-constructors';

describe('api', () => {
  describe('execute', () => {
    it('compute a simple number literal', async () => {
      const { result } = await execute('1', {});
      expect(result).toEqual(integer(1));
    });

    it('compute a simple string literal', async () => {
      const { result } = await execute('"Hello"', {});
      expect(result).toEqual(string("Hello"));
    });

    it('compute a simple function', async () => {
      const plusType = type(functionType(...[integerType, integerType, integerType].map(lazyValue)));
      const plusExpression: NativeLambdaExpression = {
        kind: ExpressionKind.NativeLambda,
        tokens: [],
        implicitParameters: [],
        parameterCount: 2,
        resultType: plusType,
        body: (a: LazyValue<Integer>, b: LazyValue<Integer>) => async () => (
          integer((await a()).value + (await b()).value)
        ),
      };
      const { result } = await execute('1 + 1', {
        variables: {
          '+': {
            value: plusExpression,
            valueType: plusType,
          },
        },
      });
      expect(result).toEqual(integer(2));
    });

    it('should include the standard library', async () => {
      const { result } = await execute('tan(1.5)');
      expect(result).toEqual(float(Math.tan(1.5)));
    });

    it('should handle functions well', async () => {
      const { result } = await execute('(tan & sin)(1.5)');
      expect(result).toEqual(float(Math.tan(Math.sin(1.5))));
    });

    it('should handle interfaces declared in the standard library', async () => {
      const { result } = await execute('1.5 + 2.5');
      expect(result).toEqual(float(4));
    });

    it('should handle multiple interfaces declared in the standard library', async () => {
      const { result } = await execute('1 + 2');
      expect(result).toEqual(integer(3));
    });
  });
});
