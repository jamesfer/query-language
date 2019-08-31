import { lazyList } from '../utils';
import { Value, LazyValue } from '../value';
import {
  application,
  boolean,
  float,
  floatType,
  integer,
  integerType,
  lazyValue,
  list,
  string, unboundVariable,
  userDefinedLiteral,
  functionType,
} from '../value-constructors';
import { convergeTypes } from './converge-types';
import { State } from './state';
import { serializeValue } from './test-utils';
import { applySubstitutions } from './variable-substitutions';

describe('convergeTypes', () => {
  describe('when given two of the same literal types', () => {
    it.each([
      integer(1),
      float(1.1),
      string('hello'),
      boolean(false),
    ])('converges', async (value) => {
      const lazy = lazyValue(value);
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazy,
        lazy,
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(lazy));
    });

    it.each<[Value, Value]>([
      [integer(1), integer(2)],
      [float(0), float(1.1)],
      [string('hello'), string('world')],
      [boolean(false), boolean(true)],
    ])('returns undefined', async (left, right) => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(left),
        lazyValue(right),
      ));
      expect(await serializeValue(converged)).toBe(undefined);
    });
  });

  describe('when given two user defined types', () => {
    it('converges when they have the same name', async () => {
      const lazyIntegerType = lazyValue(integerType);
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyIntegerType,
        lazyIntegerType,
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(lazyIntegerType));
    });

    it('returns undefined when they have a different name', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(integerType),
        lazyValue(floatType),
      ));
      expect(converged).toBe(undefined);
    });
  });

  describe('when given two list literal types', () => {
    const lazyIntegerType = lazyValue(integerType);
    const lazyFloatType = lazyValue(floatType);

    it('converges when they have the same elements', async () => {
      const lazyListType = lazyValue(list(lazyList([lazyIntegerType, lazyFloatType])));
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyListType,
        lazyListType,
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(lazyListType));
    });

    it('returns undefined when they have different elements', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(list(lazyList([lazyIntegerType, lazyFloatType]))),
        lazyValue(list(lazyList([lazyFloatType, lazyIntegerType]))),
      ));
      expect(await serializeValue(converged)).toBe(undefined);
    });

    it('returns undefined when the first is longer than the second', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(list(lazyList([lazyIntegerType, lazyFloatType]))),
        lazyValue(list(lazyList([lazyIntegerType]))),
      ));
      expect(await serializeValue(converged)).toBe(undefined);
    });

    it('returns undefined when the first is shorter than the second', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(list(lazyList([lazyIntegerType]))),
        lazyValue(list(lazyList([lazyIntegerType, lazyFloatType]))),
      ));
      expect(await serializeValue(converged)).toBe(undefined);
    });
  });

  describe('when given two applications', () => {
    it('converges when they have the same callee', async () => {
      const lazyApplicationType = lazyValue(application(
        lazyValue(userDefinedLiteral('T')),
        lazyList([]),
      ));
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyApplicationType,
        lazyApplicationType,
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(lazyApplicationType));
    });

    it('converges when they have the same callee and arguments', async () => {
      const lazyApplicationType = lazyValue(application(
        lazyValue(userDefinedLiteral('T')),
        lazyList([lazyValue(integerType)]),
      ));
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyApplicationType,
        lazyApplicationType,
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(lazyApplicationType));
    });

    it('returns undefined when they have unconvergable callees', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(application(lazyValue(integerType), lazyList([]))),
        lazyValue(application(lazyValue(floatType), lazyList([]))),
      ));
      expect(converged).toEqual(undefined);
    });

    it('returns undefined when they have unconvergable parameters', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(application(lazyValue(integerType), lazyList([lazyValue(floatType)]))),
        lazyValue(application(lazyValue(integerType), lazyList([lazyValue(integerType)]))),
      ));
      expect(converged).toEqual(undefined);
    });

    it('converges when one has an unbound variable parameter', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(application(lazyValue(integerType), lazyList([lazyValue(integerType)]))),
        lazyValue(application(lazyValue(integerType), lazyList([lazyValue(unboundVariable('T'))]))),
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(
        lazyValue(application(lazyValue(integerType), lazyList([lazyValue(integerType)])))
      ));
    });

    it('infers the type of unbound variables with the same name', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(application(lazyValue(integerType), lazyList([
          lazyValue(unboundVariable('T')),
          lazyValue(unboundVariable('T')),
        ]))),
        lazyValue(application(lazyValue(integerType), lazyList([
          lazyValue(integerType),
          lazyValue(unboundVariable('U')),
        ]))),
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(
        lazyValue(application(lazyValue(integerType), lazyList([
          lazyValue(integerType),
          lazyValue(integerType),
        ]))),
      ));
    });

    it('infers the type of unbound variables with the same name far away', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        lazyValue(application(lazyValue(integerType), lazyList([
          lazyValue(unboundVariable('T')),
          lazyValue(unboundVariable('T')),
          lazyValue(unboundVariable('T')),
        ]))),
        lazyValue(application(lazyValue(integerType), lazyList([
          lazyValue(integerType),
          lazyValue(unboundVariable('U')),
          lazyValue(unboundVariable('V')),
        ]))),
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(
        lazyValue(application(lazyValue(integerType), lazyList([
          lazyValue(integerType),
          lazyValue(integerType),
          lazyValue(integerType),
        ]))),
      ));
    });
  });

  describe('when given two function types', () => {
    it('converges when one is a partial application of the other', async () => {
      const [, converged] = State.unwrap(await convergeTypes(
        {},
        functionType(
          lazyValue(integerType),
          lazyValue(unboundVariable('T')),
        ),
        functionType(
          lazyValue(integerType),
          lazyValue(integerType),
          lazyValue(integerType),
        ),
      ));
      expect(await serializeValue(converged)).toEqual(await serializeValue(
        functionType(
          lazyValue(integerType),
          lazyValue(integerType),
          lazyValue(integerType),
        )),
      );
    });

    it('correctly substitutes when the one is a partial application of the other', async () => {
      const [substitutions, ] = State.unwrap(await convergeTypes(
        {},
        functionType(
          lazyValue(integerType),
          lazyValue(unboundVariable('T')),
        ),
        functionType(
          lazyValue(integerType),
          lazyValue(integerType),
          lazyValue(integerType),
        ),
      ));
      const substituted = applySubstitutions(substitutions.left, lazyValue(unboundVariable('T')));
      expect(await serializeValue(substituted)).toEqual(await serializeValue(
        functionType(
          lazyValue(integerType),
          lazyValue(integerType),
        )),
      );
    });

    describe('when partial applications have overlapping variables', () => {
      const binaryFunction = functionType(
        lazyValue(integerType),
        lazyValue(unboundVariable('T')),
      );
      const ternaryFunction = functionType(
        lazyValue(unboundVariable('T')),
        lazyValue(integerType),
        lazyValue(integerType),
      );

      it.each<[string, LazyValue, LazyValue]>([
        ['left', binaryFunction, ternaryFunction],
        ['right', ternaryFunction, binaryFunction],
      ])(
        'converges when the partial is on the %s',
        async (_, left, right) => {
          const [, converged] = State.unwrap(await convergeTypes({}, left, right));
          expect(await serializeValue(converged)).toEqual(await serializeValue(
            functionType(
              lazyValue(integerType),
              lazyValue(integerType),
              lazyValue(integerType),
            ),
          ));
        }
      );

      it('correctly substitutes the return value of the binary function', async () => {
        const [substitutions,] = State.unwrap(await convergeTypes(
          {},
          binaryFunction,
          ternaryFunction,
        ));
        const substituted = applySubstitutions(substitutions.left, lazyValue(unboundVariable('T')));
        expect(await serializeValue(substituted)).toEqual(await serializeValue(
          functionType(
            lazyValue(integerType),
            lazyValue(integerType),
          ),
        ));
      });
    });
  });
});

