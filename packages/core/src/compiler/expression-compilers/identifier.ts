import { addType, IdentifierExpression, } from '../../expression';
import { makeMessage, Message } from '../../message';
import {
  findScopeVariableEntry, findScopeVariableType, findScopeVariableValue,
  Scope,
} from '../../scope';
import { Token, TokenKind } from '../../token';
import { UntypedIdentifierExpression, } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { LazyNoneValue, LazyValue } from '../../value';
import { evaluateExpression } from '../evaluate-expression';


export function makeIdentifierExpression(token: Token): UntypedIdentifierExpression {
  return makeCustomIdentifierExpression(token.value, [token]);
}

export function makeCustomIdentifierExpression(name: string, tokens: Token[], messages: Message[] = []): UntypedIdentifierExpression {
  return {
    kind: 'Identifier',
    value: name,
    tokens,
    messages,
  }
}

export function interpretIdentifier(tokens: Token[]): UntypedIdentifierExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.Identifier)) {
    return makeIdentifierExpression(tokens[0]);
  }
}

export function typeIdentifier(scope: Scope, expression: UntypedIdentifierExpression): IdentifierExpression {
  const { value, tokens } = expression;
  let resultType = findScopeVariableType(scope, value);
  let messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${value}`, tokens[0]),
  ];

  return {
    kind: 'Identifier',
    value,
    tokens,
    expression: findScopeVariableEntry(scope, value),
    messages: [ ...messages, ...expression.messages ],
    resultType,
  };
}

export function evaluateIdentifier(scope: Scope, expression: IdentifierExpression): LazyValue {
  if (!expression.expression) {
    throw new Error('Can not evaluate an unrecognized identifier');
  }
  return evaluateExpression(scope, expression.expression) || LazyNoneValue;
}
