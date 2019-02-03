import { Observable } from 'rxjs';
import { MethodExpression } from '../../expression';
import { Scope } from '../../scope';
import { FunctionValue, lazyNoneValue, LazyValue, PlainFunctionValue } from '../../value';
import { evaluateExpression } from '../evaluate-expression';

export function evaluateMethod(
  scope: Scope,
  expression: MethodExpression,
): LazyValue<FunctionValue> {
  // Convert an expression into a function
  const expressionFunction: PlainFunctionValue = (...implementations) => {
    // Find the implementation called self
    const selfIndex = expression.implementationNames.indexOf('self');
    if (selfIndex === -1) {
      throw new Error('Could not find self in implementations arguments');
    }
    const self = implementations[selfIndex];
    if (!self) {
      throw new Error(`Expected the self implementation at index ${selfIndex} but it was not there`);
    }
    const functionExpression = self.methodDefinitions[expression.methodName];
    if (!functionExpression) {
      throw new Error(`Method ${expression.methodName} not found in implementation`);
    }

    const nextImplementations = [
      ...implementations.slice(0, selfIndex),
      ...implementations.slice(selfIndex + 1),
    ];
    return (...args) => {
      const lazyValue = evaluateExpression(scope, functionExpression) || lazyNoneValue;
      return lazyValue.switchMap((value) => {
        if (value.kind === 'Function') {
          return value.value(...nextImplementations)(...args);
        }
        return Observable.of(value);
      });
    };
  };
  const functionValue: FunctionValue = {
    kind: 'Function',
    value: expressionFunction,
  };
  return Observable.of(functionValue);
}
