import { makeMessage } from '../../message';
import { Token, TokenKind } from '../../token';
import { ExpressionKind, IdentifierExpression } from '../../type6Lazy/expression';
import { resolveVariable, resolveVariableType, Scope } from '../../type6Lazy/scope';
import { evaluateExpression } from '../../type6Lazy/type';
import { LazyValue } from '../../type6Lazy/value';
import { nothing } from '../../type6Lazy/value-constructors';
import { UntypedIdentifierExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { Log } from '../compiler-utils/monoids/log';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper } from '../type-expression';


export function makeIdentifierExpression(token: Token): UntypedIdentifierExpression {
  return makeCustomIdentifierExpression(token.value, [token]);
}

export function makeCustomIdentifierExpression(
  name: string,
  tokens: Token[],
): UntypedIdentifierExpression {
  return {
    tokens,
    kind: 'Identifier',
    value: name,
  };
}

export const interpretIdentifier: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.Identifier)) {
    return Log.of(makeIdentifierExpression(tokens[0]));
  }
  return Log.of(undefined);
};

export const typeIdentifier: ExpressionTyper<UntypedIdentifierExpression> = (scope, inferredTypes, expression) => {
  const logScope = LogTypeScope.fromVariables(inferredTypes);
  const { value, tokens } = expression;
  const resultType = resolveVariableType(scope, value);
  if (!resultType) {
    logScope.push(makeMessage('Error', `Unrecognized identifier ${value}`, tokens[0]));
  }

  return logScope.wrap<IdentifierExpression>({
    resultType,
    tokens,
    kind: ExpressionKind.Identifier,
    name: value,
  });
};

export function evaluateIdentifier(scope: Scope, expression: IdentifierExpression): LazyValue {
  const actualExpression = resolveVariable(scope, expression.name);
  if (!actualExpression) {
    // TODO handle errors better
    throw new Error('Can not evaluate an unrecognized identifier');
  }
  return evaluateExpression(scope, actualExpression) || (async () => nothing);
}
