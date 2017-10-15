import {
  PartialPlaceholder,
  evaluateExpression
} from '../evaluate-expression';
import { TypedFunctionCallExpression } from '../../type-expression/typers/function-call';
import { map, partial, filter } from 'lodash';
import { FunctionType } from 'type.model';
import { TypedExpression } from '../../typed-expression.model';
import { Value, LazyValue } from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';

interface Placeholder {
  (...a: any[]): any;
  placeholder: PartialPlaceholder;
}


function evaluateFunctionExpression(scope: EvaluationScope, expression: TypedExpression): (...args: LazyValue[]) => Value {
  // Evaluate the function expression
  let lazyFunc = evaluateExpression(scope, expression);
  if (!lazyFunc) {
    throw new Error('Attempted to call an unrecognized expression.');
  }

  let func = lazyFunc();
  if (func.kind !== 'Function') {
    throw new Error('Attempted to call an expression that is not a function');
  }
  // TODO check the result is not null
  // TODO check that value is is a function type
  return func.value;
}

function evaluateArguments(scope: EvaluationScope, expressions: (TypedExpression | null)[]): (LazyValue | PartialPlaceholder)[] {
  // Evaluate each of the arguments
  let args: (LazyValue | undefined)[] = map(expressions, arg => {
    return arg ? evaluateExpression(scope, arg) : undefined;
  });

  // Replace empty args with placeholder
  return map(args, arg => {
    return arg === undefined ? (partial as Placeholder).placeholder : arg;
  });
}

export function evaluateFunctionCall(scope: EvaluationScope, expression: TypedFunctionCallExpression): LazyValue {
  const argCount = filter(expression.args, arg => !!arg).length;
  const arity = (expression.functionExpression.resultType as FunctionType).argTypes.length;

  let func = evaluateFunctionExpression(scope, expression.functionExpression);
  let args = evaluateArguments(scope, expression.args);

  if (argCount === arity) {
    return () => func(...args as LazyValue[]);
  }
  else if (argCount < arity) {
    let value = partial(func, args) as (...args: LazyValue[]) => Value;
    return () => ({
      kind: 'Function',
      value,
    });
  }
  else {
    throw new Error('Too many arguments');
  }
}
