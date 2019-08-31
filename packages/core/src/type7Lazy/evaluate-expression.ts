import { assertNever } from '../utils';
import { Expression, ExpressionKind } from './expression';
import { State, StateResult } from './type/state';
import { lazyList, pMap } from './utils';
import { LazyValue, ValueKind } from './value';
import {
  anything,
  boolean,
  float,
  integer,
  lazyValue,
  list,
  nothing,
  string,
} from './value-constructors';

// TODO add scope
export async function evaluateExpression(scope: any, expression: Expression): Promise<StateResult<LazyValue>> {
  const state = State.of({});

  switch (expression.kind) {
    case ExpressionKind.Anything:
      return state.wrap(lazyValue(anything));
    case ExpressionKind.Nothing:
      return state.wrap(lazyValue(nothing));
    case ExpressionKind.String:
      return state.wrap(lazyValue(string(expression.value)));
    case ExpressionKind.Integer:
      return state.wrap(lazyValue(integer(expression.value)));
    case ExpressionKind.Float:
      return state.wrap(lazyValue(float(expression.value)));
    case ExpressionKind.Boolean:
      return state.wrap(lazyValue(boolean(expression.value)));
    case ExpressionKind.List: {
      const values = await pMap(expression.elements, state.runAsyncP1(evaluateExpression));
      return state.wrap(lazyValue(list(lazyList(values))));
    }
    case ExpressionKind.NativeLambda:
      return state.wrap(lazyValue({
        kind: ValueKind.NativeLambda,
        parameterCount: expression.parameterCount,
        body: expression.body,
      }));
    case ExpressionKind.Lambda: {
      return state.wrap(lazyValue({
        kind: ValueKind.NativeLambda,
        parameterCount: expression.parameterNames.length,
        body: (...parameters) => async () => {
          // TODO add parameters to scope under expression.parameterNames
          // TODO messages emitted at this state are not propagated anywhere because the state has
          //      already been returned to the caller.
          const result = await state.runAsync(evaluateExpression, expression.body);
          return await result();
        },
      }));
    }
    case ExpressionKind.Application: {
      const callee = await state.runAsync(evaluateExpression, expression.callee);
      const parameters = await pMap(expression.parameters, parameter => (
        state.runAsync(evaluateExpression, parameter)
      ));
      return state.wrap<LazyValue>(async () => {
        const resolvedCallee = await callee();
        switch (resolvedCallee.kind) {
          case ValueKind.NativeLambda: {
            if (parameters.length === resolvedCallee.parameterCount) {
              return await resolvedCallee.body(...parameters)();
            }

            if (parameters.length < resolvedCallee.parameterCount) {
              return {
                kind: ValueKind.NativeLambda,
                parameterCount: resolvedCallee.parameterCount - parameters.length,
                body: (...args) => resolvedCallee.body(...parameters, ...args),
              };
            }
          }

          case ValueKind.Anything:
          case ValueKind.Nothing:
          case ValueKind.Integer:
          case ValueKind.Float:
          case ValueKind.String:
          case ValueKind.Boolean:
          case ValueKind.List:
          case ValueKind.UserDefinedLiteral:
          case ValueKind.Application:
          case ValueKind.UnboundVariable:
          case ValueKind.Lambda:
          case ValueKind.BoundVariable:
            return nothing;

          default:
            return assertNever(resolvedCallee);
        }
      });
    }


    case ExpressionKind.Identifier:
      // TODO look up in scope
      return state.wrap(lazyValue(nothing));
    case ExpressionKind.PolymorphicLambda:
      return state.wrap(lazyValue(nothing));

    default:
      return assertNever(expression);
  }
}
