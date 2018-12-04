import { isFunction, merge, zipObject, Dictionary } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Expression, FunctionExpression } from '../../expression';
import { makeFunctionType, noneType, TokenKind } from '../../qlang';
import {
  expandTypeScope,
  findTypeVariableInScope,
  Scope,
} from '../../scope';
import { makeTypeVariable } from '../../type/constructors';
import { VariableType } from '../../type/type';
import {
  makeUntypedUnrecognizedExpression,
  UntypedFunctionExpression,
} from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { FunctionValue, lazyNoneValue, LazyValue, PlainFunctionValue } from '../../value';
import { evaluateExpression } from '../evaluate-expression';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';
import { ExpressionTyper, makeUnrecognizedExpression, typeExpression } from '../type-expression';


export const interpretFunction: ExpressionInterpreter = (incomingTokens) => {
  if (tokenArrayMatches(incomingTokens, TokenKind.Identifier)) {
    // TODO support multiple arguments
    const argToken = incomingTokens[0];
    let tokens = incomingTokens.slice(1);
    if (tokenArrayMatches(tokens, TokenKind.FatArrow)) {
      const arrowToken = tokens[0];
      tokens = tokens.slice(1);

      const bodyExpression = interpretExpression(tokens) || makeUntypedUnrecognizedExpression([]);
      return {
        kind: 'Function',
        arguments: [argToken],
        tokens: [argToken, arrowToken, ...bodyExpression.tokens],
        messages: [],
        value: bodyExpression,
      };
    }
  }
  return undefined;
};


export const typeFunction: ExpressionTyper<UntypedFunctionExpression> = (scope, typeVariables, expression) => {
  // Create inner function scope
  const argumentTypes: Dictionary<VariableType> = {};
  expression.arguments.forEach((argument) => {
    argumentTypes[argument.value] = makeTypeVariable(`${argument.value}T`);
  });
  const functionScope = expandTypeScope(scope, argumentTypes);

  // Determine the type of the function body
  const [inferredVariables, maybeBodyExpression] = typeExpression(functionScope, typeVariables, expression.value);
  const bodyExpression = maybeBodyExpression || makeUnrecognizedExpression(expression.value);

  // Create the inferred function type
  const inferredArgumentTypes = Object.values(argumentTypes).map(argumentType => (
    findTypeVariableInScope(inferredVariables, argumentType.identifier) || noneType
  ));
  const bodyType = bodyExpression.resultType || noneType;
  const inferredFunctionType = makeFunctionType(inferredArgumentTypes, bodyType);

  return [inferredVariables, {
    kind: 'Function',
    resultType: inferredFunctionType,
    value: bodyExpression,
    argumentNames: expression.arguments.map(arg => arg.value),
    tokens: expression.tokens,
    // TODO add messages if any typing failed
    messages: [],
  }];
};

function isFunctionValue(value: FunctionValue | Expression): value is FunctionValue {
  return value.kind === 'Function' && isFunction(value.value);
}

export function evaluateFunction(scope: Scope, expression: FunctionExpression)
: LazyValue<FunctionValue> {
  // Check if the value is a native function
  const funcValue = expression.value;
  if (isFunctionValue(funcValue)) {
    return Observable.of(funcValue);
  }

  // const funcType = expression.resultType;
  // if (!funcType || funcType.kind !== 'Function') {
  //   throw new Error('Tried to evaluate a function expression that was not a function');
  // }

  // Convert an expression into a function
  const expressionFunction: PlainFunctionValue = (...args) => {
    const argumentValues = zipObject(expression.argumentNames, args);
    const functionScope = merge({}, scope, { variables: argumentValues });
    return Observable.of(evaluateExpression(functionScope, funcValue))
      .switchMap(value => value === undefined ? lazyNoneValue : value);
  };
  const functionValue: FunctionValue = {
    kind: 'Function',
    value: expressionFunction,
  };
  return Observable.of(functionValue);
}
