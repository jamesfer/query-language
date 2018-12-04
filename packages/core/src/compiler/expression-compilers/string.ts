import { head, last } from 'lodash';
import { addType, StringExpression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { Scope, TypeScope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { stringType } from '../../type/constructors';
import { UntypedExpression, UntypedStringExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { LazyValue, makeStringValue, StringValue } from '../../value';
import { Observable } from 'rxjs/Observable';
import { ExpressionTyper } from '../type-expression';


function makeStringExpression(token: Token, messages: Message[] = []): UntypedStringExpression {
  const value = token.value;
  const contents = last(value) === value[0]
    ? value.slice(1, -1)
    : value.slice(1);
  return {
    messages,
    kind: 'String',
    tokens: [token],
    value: contents,
  };
}

export function interpretString(tokens: Token[]): UntypedExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.StringLiteral)) {
    const messages: Message[] = [];
    const strToken = tokens[0];
    if (head(strToken.value) !== last(strToken.value)) {
      messages.push(makeMessage('Error', 'String literal is missing closing quote.', strToken.end));
    }
    return makeStringExpression(strToken, messages);
  }
}

export const typeString: ExpressionTyper<UntypedStringExpression> = (scope, typeVariables, expression) => {
  return [typeVariables, addType(expression, stringType)];
};

export function evaluateString(scope: Scope, expression: StringExpression): LazyValue<StringValue> {
  return Observable.of(makeStringValue(expression.value));
}
