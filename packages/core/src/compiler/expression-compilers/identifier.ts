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
  let resultType = findScopeVariableType(scope, expression.value);
  let messages: Message[] = resultType ? [] : [
    makeMessage('Error', `Unrecognized identifier ${expression.value}`, expression.tokens[0]),
  ];


  const identifiedExpression = findScopeVariableEntry(scope, expression.value);
  if (!identifiedExpression) {
    throw new Error('Unknown identifier');
  }
  
  return {
    kind: 'Identifier',
    value: expression.value,
    tokens: expression.tokens,
    expression: identifiedExpression,
    messages: [
      ...messages,
      ...expression.messages,
    ],
    resultType,
  };
}

export function evaluateIdentifier(scope: Scope, expression: IdentifierExpression): LazyValue {
  return evaluateExpression(scope, expression.expression) || LazyNoneValue;
}
