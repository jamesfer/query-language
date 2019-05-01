import { Expression } from '../type6Lazy/expression';
import { Scope } from '../type6Lazy/scope';
import { evaluateExpression } from '../type6Lazy/type';
import { LazyValue, ValueKind } from '../type6Lazy/value';
import { assertNever } from '../utils';

export type PartialPlaceholder = {};

export function stripLazyValue(lazyValue: LazyValue): (() => Promise<any>) {
  return async () => {
    const value = await lazyValue();
    switch (value.kind) {
      case ValueKind.Float:
      case ValueKind.Integer:
      case ValueKind.String:
      case ValueKind.Boolean:
        return async () => value.value;

      case ValueKind.Anything:
      case ValueKind.Nothing:
        return async () => null;

      case ValueKind.List:
        return async () => {
          const result = [];
          for (const element of value.values()) {
            result.push(await stripLazyValue(element)());
          }
          return result;
        };

      case ValueKind.UnboundVariable:
      case ValueKind.TypeInterface:
      case ValueKind.Lambda:
      case ValueKind.NativeLambda:
      case ValueKind.UserDefinedLiteral:
      case ValueKind.Application:
        return async () => null;

      default:
        return assertNever(value);
    }
  };
}

export function evaluateSyntaxTree(scope: Scope, expression: Expression)
: (() => Promise<any>) | undefined {
  const lazyValue = evaluateExpression(scope, expression);
  if (lazyValue) {
    return stripLazyValue(lazyValue);
  }
}
