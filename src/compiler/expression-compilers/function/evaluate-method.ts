import { Scope } from '../../../scope';
import {
  Expression,
  FunctionCallExpression, FunctionExpression,
  MethodCallExpression,
  MethodExpression,
} from '../../../expression';
import { FunctionValue, LazyValue } from '../../../value';
import { keys } from 'lodash';
import { evaluateExpression } from '../../evaluate-expression';
import { evaluateFunctionCall } from './evaluate-function-call';

export function evaluateMethod(scope: Scope, expression: MethodExpression | MethodCallExpression): LazyValue | undefined {
  const implementationKeys = keys(expression.implementations);
  if (implementationKeys.length > 1) {
    throw new Error('Cannot evaluate a method that has not been narrowed to a single implementation');
  }

  if (implementationKeys.length === 0) {
    throw new Error('Cannot evaluate a method that has no implementations');
  }

  const implementation = expression.implementations[implementationKeys[0]];
  const functionExpression: FunctionExpression = {
    kind: 'Function',
    messages: expression.messages,
    tokens: expression.tokens,
    resultType: expression.kind === 'Method' ? expression.resultType : expression.functionExpression.resultType,
    value: implementation.value,
    argumentNames: implementation.argumentNames,
  };

  if (expression.kind === 'Method') {
    return evaluateExpression(scope, functionExpression);
  }

  const functionCall: FunctionCallExpression = {
    resultType: expression.resultType,
    functionExpression: functionExpression,
    args: expression.args,
    kind: 'FunctionCall',
    tokens: [],
    messages: [],
  };
  return evaluateFunctionCall(scope, functionCall);
}
