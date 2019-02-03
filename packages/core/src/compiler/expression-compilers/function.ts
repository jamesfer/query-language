import { Dictionary, isFunction, merge, zipObject, map } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Expression, FunctionExpression } from '../../expression';
import { makeFunctionType, noneType, TokenKind } from '../../qlang';
import {
  expandTypeScope,
  findTypeVariableInScope,
  Scope,
  clearInterfacesFromTypeScope,
  expandScope,
} from '../../scope';
import { makeTypeVariable } from '../../type/constructors';
import { VariableType } from '../../type/type';
import {
  makeUntypedUnrecognizedExpression,
  UntypedFunctionExpression,
} from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { FunctionValue, lazyNoneValue, LazyValue, PlainFunctionValue } from '../../value';
import { Log } from '../compiler-utils/monoids/log';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';
import { evaluateExpression } from '../evaluate-expression';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';
import { ExpressionTyper, makeUnrecognizedExpression, typeExpression } from '../type-expression';


export const interpretFunction: ExpressionInterpreter = (incomingTokens) => {
  if (tokenArrayMatches(incomingTokens, TokenKind.Identifier)) {
    const log = Log.empty();
    // TODO support multiple arguments
    const argToken = incomingTokens[0];
    let tokens = incomingTokens.slice(1);
    if (tokenArrayMatches(tokens, TokenKind.FatArrow)) {
      const arrowToken = tokens[0];
      tokens = tokens.slice(1);

      const bodyExpression = log.combine(interpretExpression(tokens))
        || makeUntypedUnrecognizedExpression([]);
      return log.wrap<UntypedFunctionExpression>({
        kind: 'Function',
        arguments: [argToken],
        tokens: [argToken, arrowToken, ...bodyExpression.tokens],
        value: bodyExpression,
      });
    }
  }
  return Log.of(undefined);
};


export const typeFunction: ExpressionTyper<UntypedFunctionExpression> = (scope, typeVariables, expression) => {
  const logScope = LogTypeScope.fromVariables(typeVariables);

  // Create inner function scope
  const argumentTypes: Dictionary<VariableType> = {};
  expression.arguments.forEach((argument) => {
    argumentTypes[argument.value] = makeTypeVariable(`${argument.value}T`);
  });
  const functionScope = expandTypeScope(scope, argumentTypes);

  // Determine the type of the function body
  const typeExpressionResult = typeExpression(functionScope, typeVariables, expression.value);
  const bodyExpression = logScope.combine(typeExpressionResult)
    || makeUnrecognizedExpression(expression.value);

  // TODO add messages if any typing failed

  // Collect the implementations from the type scope
  const restrictions = map(logScope.getScope().interfaces, (restriction, name) => ({ restriction, name }));
  const implementations = map(restrictions, 'restriction');
  const implementationNames = map(restrictions, 'name');

  // Create the inferred function type
  const inferredArgumentTypes = Object.values(argumentTypes).map(argumentType => (
    findTypeVariableInScope(logScope.getScope(), argumentType.identifier) || noneType
  ));
  const bodyType = bodyExpression.resultType || noneType;
  const inferredFunctionType = makeFunctionType(
    implementations,
    inferredArgumentTypes,
    bodyType,
  );

  const newTypeVariables = clearInterfacesFromTypeScope(logScope.getScope());

  return LogTypeScope.fromVariables(newTypeVariables).wrap<FunctionExpression>({
    implementationNames,
    kind: 'Function',
    resultType: inferredFunctionType,
    value: bodyExpression,
    argumentNames: expression.arguments.map(arg => arg.value),
    tokens: expression.tokens,
  });
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
  const expressionFunction: PlainFunctionValue = (...implementations) => {
    const implementationValues = zipObject(expression.implementationNames, implementations);
    const implementationScope = expandScope(scope, { implementations: implementationValues });
    return (...args) => {
      const argumentValues = zipObject(expression.argumentNames, args);
      // TODO
      const functionScope = expandScope(implementationScope, { variables: argumentValues });
      return Observable.of(evaluateExpression(functionScope, funcValue))
        .switchMap(value => value === undefined ? lazyNoneValue : value);
    };
  };
  const functionValue: FunctionValue = {
    kind: 'Function',
    value: expressionFunction,
  };
  return Observable.of(functionValue);
}
