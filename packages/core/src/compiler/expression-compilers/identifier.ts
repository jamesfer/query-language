import { IdentifierExpression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { findScopeVariableEntry, findTypeInScope, Scope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { UntypedIdentifierExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { lazyNoneValue, LazyValue } from '../../value';
import { evaluateExpression } from '../evaluate-expression';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper } from '../type-expression';


export function makeIdentifierExpression(token: Token): UntypedIdentifierExpression {
  return makeCustomIdentifierExpression(token.value, [token]);
}

export function makeCustomIdentifierExpression(
  name: string,
  tokens: Token[],
  messages: Message[] = [],
): UntypedIdentifierExpression {
  return {
    tokens,
    messages,
    kind: 'Identifier',
    value: name,
  };
}

export const interpretIdentifier: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.Identifier)) {
    return makeIdentifierExpression(tokens[0]);
  }
  return undefined;
};

export const typeIdentifier: ExpressionTyper<UntypedIdentifierExpression> = (scope, typeVariables, expression) => {
  const { value, tokens } = expression;
  const resultType = findTypeInScope(scope, value);
  const messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${value}`, tokens[0]),
  ];

  // TODO maybe duplicate the identifier's type variable if it points to one

  return [typeVariables, {
    resultType,
    value,
    tokens,
    kind: 'Identifier',
    messages: [...messages, ...expression.messages],
  }];
};

export function evaluateIdentifier(scope: Scope, expression: IdentifierExpression): LazyValue {
  const actualExpression = findScopeVariableEntry(scope, expression.value);
  if (!actualExpression) {
    throw new Error('Can not evaluate an unrecognized identifier');
  }
  return evaluateExpression(scope, actualExpression) || lazyNoneValue;
}
