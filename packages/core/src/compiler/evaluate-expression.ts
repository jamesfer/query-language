import { assertNever } from '../utils';
import { EvaluationScope, findVariableInScope2 } from './evaluation-scope';
import { Expression, ExpressionKind } from './expression';
import { lazyList, pMap } from './utils';
import { LazyValue } from './value';
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

export async function evaluateExpression2(
  scope: EvaluationScope,
  expression: Expression,
  parameters: Expression[],
): Promise<LazyValue> {
  switch (expression.kind) {
    case ExpressionKind.Anything:
      return lazyValue(anything);

    case ExpressionKind.Nothing:
      return lazyValue(nothing);

    case ExpressionKind.String:
      return lazyValue(string(expression.value));

    case ExpressionKind.Integer:
      return lazyValue(integer(expression.value));

    case ExpressionKind.Float:
      return lazyValue(float(expression.value));

    case ExpressionKind.Boolean:
      return lazyValue(boolean(expression.value));

    case ExpressionKind.List: {
      const values = await pMap(expression.elements, element => (
        evaluateExpression2(scope, element, [])
      ));
      return lazyValue(list(lazyList(values)));
    }

    case ExpressionKind.Identifier: {
      const value = findVariableInScope2(scope, expression.name);
      if (!value) {
        throw new Error(`Cannot find identifier ${expression.name} in scope`);
      }
      return evaluateExpression2(scope, value, parameters);
    }

    case ExpressionKind.NativeLambda:
      return expression.body(...await pMap(parameters, parameter => (
        evaluateExpression2(scope, parameter, [])
      )));

    case ExpressionKind.Lambda: {
      if (parameters.length < expression.parameterNames.length) {
        throw new Error('Not enough parameters');
      }

      const newScope = {
        parent: scope,
        variables: expression.parameterNames.reduce(
          (variables, name, index) => ({
            ...variables,
            [name]: { value: parameters[index] },
          }),
          {},
        ),
      };

      return evaluateExpression2(
        newScope,
        expression.body,
        parameters.slice(expression.parameterNames.length),
      );
    }

    case ExpressionKind.PolymorphicLambda:
      // TODO not sure how to implement this one
      return lazyValue(nothing);

    case ExpressionKind.Application: {
      if (expression.parameters.some(parameter => parameter === null)) {
        throw new Error('Failed to call function, some of the parameters were null');
      }

      return evaluateExpression2(
        scope,
        expression.callee,
        [...expression.parameters as Expression[], ...parameters],
      );
    }

    default:
      return assertNever(expression);
  }
}
