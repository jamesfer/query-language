import { Dictionary, map, zipObject } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { TokenKind } from '../../qlang';
import { ExpressionKind, LambdaExpression } from '../../type6Lazy/expression';
import {
  clearImplicitInterfaces,
  expandScope,
  createChildScope,
  findInferredVariableType,
  Scope,
} from '../../type6Lazy/scope';
import { makeType } from '../../type6Lazy/type';
import { Lambda, LazyValue, NativeLambda, UnboundVariable } from '../../type6Lazy/value';
import { functionType, nothing, unboundVariable } from '../../type6Lazy/value-constructors';
import {
  makeUntypedUnrecognizedExpression,
  UntypedFunctionExpression,
} from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { Log } from '../compiler-utils/monoids/log';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';
import { ExpressionTyper, typeExpression } from '../type-expression';


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


export const typeFunction: ExpressionTyper<UntypedFunctionExpression> = (scope, inferredTypes, expression) => {
  const logScope = LogTypeScope.fromVariables(inferredTypes);

  // Create inner function scope
  const argumentTypes: Dictionary<UnboundVariable> = {};
  expression.arguments.forEach((argument) => {
    argumentTypes[argument.value] = unboundVariable(`${argument.value}T`);
  });
  const functionScope = createChildScope(scope, argumentTypes);

  // Determine the type of the function body
  const typeExpressionResult = typeExpression(functionScope, inferredTypes, expression.value);
  const bodyExpression = logScope.combine(typeExpressionResult);
    // || makeUnrecognizedExpression(expression.value);
  if (!bodyExpression) {
    // TODO handle errors better
    throw new Error('Failed to add type to function body');
  }

  // TODO add messages if any typing failed

  // Collect the implementations from the type scope
  const restrictions = map(logScope.getScope().implicitInterfaceParameters, (restriction, name) => ({ restriction, name }));
  const implementations = map(restrictions, 'restriction');
  const implementationNames = map(restrictions, 'name');

  // Create the inferred function type
  const inferredArgumentTypes = Object.values(argumentTypes).map(argumentType => (
    findInferredVariableType(logScope.getScope(), argumentType.uniqueIdentifier) || nothing
  ));
  const bodyType = bodyExpression.resultType || makeType(async () => nothing);
  const inferredFunctionType = makeType(
    async () => functionType(...inferredArgumentTypes, await bodyType.value()),
    [...implementations, ...bodyType.constraints],
  );

  const newTypeVariables = clearImplicitInterfaces(logScope.getScope());

  return LogTypeScope.fromVariables(newTypeVariables).wrap<LambdaExpression>({
    // implementationNames, TODO
    kind: ExpressionKind.Lambda,
    resultType: inferredFunctionType,
    body: bodyExpression,
    parameterNames: expression.arguments.map(arg => arg.value),
    tokens: expression.tokens,
  });
};

// function isFunctionValue(value: FunctionValue | Expression): value is FunctionValue {
//   return value.kind === 'Function' && isFunction(value.value);
// }

export function evaluateFunction(
  scope: Scope,
  expression: LambdaExpression,
): LazyValue<Lambda> {
  // const funcType = expression.resultType;
  // if (!funcType || funcType.kind !== 'Function') {
  //   throw new Error('Tried to evaluate a function expression that was not a function');
  // }

  // Convert an expression into a function
  const expressionFunction: any = (...implementations) => {
    const implementationValues = zipObject(expression.implementationNames, implementations);
    const implementationScope = expandScope(scope, { implementations: implementationValues });
    return (...args) => {
      const argumentValues = zipObject(expression.argumentNames, args);
      const functionScope = expandScope(implementationScope, { variables: argumentValues });
      return evaluateExpression(functionScope, funcValue))
        .switchMap(value => value === undefined ? lazyNoneValue : value);
    };
  };
  const functionValue: FunctionValue = {
    kind: 'Function',
    value: expressionFunction,
  };
  return Observable.of(functionValue);
}
