import { zipObject } from 'lodash';
import { assertNever } from '../utils';
import { EvaluationScope, findVariableInScope2 } from './evaluation-scope';
import { Expression, ExpressionKind } from './expression';
import { lazyList } from './utils';
import { LazyValue, NativeLambda, Value, ValueKind } from './value';
import {
  anything,
  boolean,
  float,
  integer,
  lazyValue,
  list,
  nothing,
  record,
  string,
} from './value-constructors';

// function resolveImplicitParameters(scope: EvaluationScope, parentImplicits: Expression[], implicits: (string | number)[]): Expression[] {
//   const implicitParameters = implicits.map(parameter => (
//     typeof parameter === 'string'
//       ? findVariableInScope2(scope, parameter)
//       : parentImplicits[parameter]
//   ));
//   if (implicitParameters.some(parameter => parameter === undefined)) {
//     throw new Error(`Could not find some implicit parameters ${implicitParameters}`);
//   }
//
//   return implicitParameters as Expression[];
// }

// export async function evaluateExpression2(
//   scope: EvaluationScope,
//   expression: Expression,
//   parameters: Expression[],
//   parentImplicits: Expression[],
// ): Promise<LazyValue> {
//   switch (expression.kind) {
//     case ExpressionKind.Anything:
//       return lazyValue(anything);
//
//     case ExpressionKind.Nothing:
//       return lazyValue(nothing);
//
//     case ExpressionKind.String:
//       return lazyValue(string(expression.value));
//
//     case ExpressionKind.Integer:
//       return lazyValue(integer(expression.value));
//
//     case ExpressionKind.Float:
//       return lazyValue(float(expression.value));
//
//     case ExpressionKind.Boolean:
//       return lazyValue(boolean(expression.value));
//
//     case ExpressionKind.List: {
//       const implicitParameters = resolveImplicitParameters(
//         scope,
//         parentImplicits,
//         expression.implicitParameters,
//       );
//       const values = await pMap(expression.elements, element => (
//         evaluateExpression2(scope, element, [], implicitParameters)
//       ));
//       return lazyValue(list(lazyList(values)));
//     }
//
//     case ExpressionKind.Record: {
//       const keys = Object.keys(expression.properties);
//       const implicitParameters = resolveImplicitParameters(
//         scope,
//         parentImplicits,
//         expression.implicitParameters,
//       );
//       const values = await pMap(keys, key => (
//         evaluateExpression2(scope, expression.properties[key], [], implicitParameters)
//       ));
//       return lazyValue(record(zipObject(keys, values)));
//     }
//
//     case ExpressionKind.Identifier: {
//       const value = findVariableInScope2(scope, expression.name);
//       if (!value) {
//         throw new Error(`Cannot find identifier ${expression.name} in scope`);
//       }
//       const implicitParameters = resolveImplicitParameters(
//         scope,
//         parentImplicits,
//         expression.implicitParameters,
//       );
//
//       // Turn the identifier into an application if there are implicit parameters
//       return evaluateExpression2(scope, value, [...implicitParameters, ...parameters], []);
//     }
//
//     case ExpressionKind.NativeLambda: {
//       const implicitParameters = resolveImplicitParameters(
//         scope,
//         parentImplicits,
//         expression.implicitParameters,
//       );
//       const nativeParameters = [
//         ...implicitParameters,
//         ...parameters,
//       ].slice(0, expression.parameterCount);
//       return expression.body(
//         ...await pMap(nativeParameters, parameter => (
//           evaluateExpression2(scope, parameter, [], parentImplicits))
//         ),
//       );
//     }
//
//     case ExpressionKind.Lambda: {
//       const implicitParameters = resolveImplicitParameters(
//         scope,
//         parentImplicits,
//         expression.implicitParameters,
//       );
//
//       const allParameters = [...implicitParameters, ...parameters];
//       if (allParameters.length < expression.parameterNames.length) {
//         throw new Error('Not enough parameters');
//       }
//
//       const newScope = {
//         parent: scope,
//         variables: expression.parameterNames.reduce(
//           (variables, name, index) => ({
//             ...variables,
//             [name]: { value: allParameters[index] },
//           }),
//           {},
//         ),
//       };
//
//       return evaluateExpression2(
//         newScope,
//         expression.body,
//         parameters.slice(expression.parameterNames.length),
//         parentImplicits,
//       );
//     }
//
//     case ExpressionKind.PolymorphicLambda:
//       // TODO not sure how to implement this one
//       return lazyValue(nothing);
//
//     case ExpressionKind.Application: {
//       if (expression.parameters.some(parameter => parameter === null)) {
//         throw new Error('Failed to call function, some of the parameters were null');
//       }
//
//       const implicitParameters = resolveImplicitParameters(
//         scope,
//         parentImplicits,
//         expression.implicitParameters,
//       );
//
//       return evaluateExpression2(
//         scope,
//         expression.callee,
//         [...expression.parameters as Expression[], ...parameters],
//         implicitParameters as Expression[],
//       );
//     }
//
//     default:
//       return assertNever(expression);
//   }
// }



export function evaluateExpression3(
  scope: EvaluationScope,
  expression: Expression,
  // parentImplicits: Expression[],
): LazyValue {
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
      return lazyValue(list(lazyList(expression.elements.map(element => (
        evaluateExpression3(scope, element)
      )))));
    }

    case ExpressionKind.Record: {
      const keys = Object.keys(expression.properties);
      return lazyValue(record(zipObject(keys, keys.map(key => (
        evaluateExpression3(scope, expression.properties[key])
      )))));
    }

    case ExpressionKind.Identifier: {
      const value = findVariableInScope2(scope, expression.name);
      if (!value) {
        throw new Error(`Cannot find identifier ${expression.name} in scope`);
      }

      if (typeof value === 'function') {
        return value;
      }

      return evaluateExpression3(scope, value);
    }

    case ExpressionKind.NativeLambda: {
      return lazyValue({
        kind: ValueKind.NativeLambda,
        parameterCount: expression.parameterCount,
        body: expression.body,
      });
    }

    case ExpressionKind.Lambda: {
      return lazyValue({
        kind: ValueKind.NativeLambda,
        parameterCount: expression.parameterNames.length,
        body: (...args: LazyValue[]) => {
          const newScope = {
            parent: scope,
            variables: expression.parameterNames.reduce(
              (variables, name, index) => ({
                ...variables,
                [name]: { value: args[index] },
              }),
              {},
            ),
          };

          return evaluateExpression3(newScope, expression.body);
        },
      });
    }

    case ExpressionKind.PolymorphicLambda:
      // TODO not sure how to implement this one
      return lazyValue(nothing);

    case ExpressionKind.Application: {
      if (expression.parameters.some(parameter => parameter === null)) {
        throw new Error('Failed to call function, some of the parameters were null');
      }

      const parameters = expression.parameters.map(parameter => (
        evaluateExpression3(scope, parameter as Expression)
      ));

      const callee = evaluateExpression3(scope, expression.callee);

      return async (): Promise<Value> => {
        const resolvedCallee = await callee();
        if (resolvedCallee.kind === ValueKind.NativeLambda) {
          let remainingParameters = parameters;
          let result: Value = resolvedCallee;
          while (remainingParameters.length && result.kind === ValueKind.NativeLambda) {
            if (remainingParameters.length >= result.parameterCount) {
              const usedParameters = remainingParameters.slice(0, result.parameterCount);
              remainingParameters = remainingParameters.slice(result.parameterCount);
              result = await result.body(...usedParameters)();
            } else {
              const lambda: NativeLambda = result;
              return {
                ...result,
                parameterCount: result.parameterCount - remainingParameters.length,
                body: (...args: LazyValue[]) => lambda.body(...remainingParameters, ...args),
              };
            }
          }
          return result;
        }
        return nothing;
      };
    }

    case ExpressionKind.Binding:
      return async () => nothing;

    case ExpressionKind.Interface:
      return async () => nothing;

    case ExpressionKind.Implementation:
      return async () => nothing;

    default:
      return assertNever(expression);
  }
}
