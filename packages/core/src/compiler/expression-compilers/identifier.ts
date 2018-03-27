import { IdentifierExpression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { findScopeVariableEntry, findScopeVariableType, Scope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { UntypedIdentifierExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { lazyNoneValue, LazyValue } from '../../value';
import { evaluateExpression } from '../evaluate-expression';


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

export function interpretIdentifier(tokens: Token[]): UntypedIdentifierExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.Identifier)) {
    return makeIdentifierExpression(tokens[0]);
  }
}

export function typeIdentifier(scope: Scope, expression: UntypedIdentifierExpression)
: IdentifierExpression {
  const { value, tokens } = expression;
  const resultType = findScopeVariableType(scope, value);
  const messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${value}`, tokens[0]),
  ];

  return {
    resultType,
    value,
    tokens,
    kind: 'Identifier',
    expression: findScopeVariableEntry(scope, value),
    messages: [...messages, ...expression.messages],
  };
}

export function evaluateIdentifier(scope: Scope, expression: IdentifierExpression): LazyValue {
  if (!expression.expression) {
    throw new Error('Can not evaluate an unrecognized identifier');
  }
  return evaluateExpression(scope, expression.expression) || lazyNoneValue;
}
