import { IdentifierExpression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { findScopeVariableEntry, findTypeInScope, Scope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { UntypedIdentifierExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { lazyNoneValue, LazyValue } from '../../value';
import { Log } from '../compiler-utils/monoids/log';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';
import { evaluateExpression } from '../evaluate-expression';
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

export const typeIdentifier: ExpressionTyper<UntypedIdentifierExpression> = (scope, typeVariables, expression) => {
  const logScope = LogTypeScope.fromVariables(typeVariables);
  const { value, tokens } = expression;
  const resultType = findTypeInScope(scope, value);
  if (!resultType) {
    logScope.push(makeMessage('Error', `Unrecognized identifier ${value}`, tokens[0]));
  }

  return logScope.wrap<IdentifierExpression>({
    resultType,
    value,
    tokens,
    kind: 'Identifier',
  });
};

export function evaluateIdentifier(scope: Scope, expression: IdentifierExpression): LazyValue {
  const actualExpression = findScopeVariableEntry(scope, expression.value);
  if (!actualExpression) {
    throw new Error('Can not evaluate an unrecognized identifier');
  }
  return evaluateExpression(scope, actualExpression) || lazyNoneValue;
}
