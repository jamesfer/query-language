import { head, last } from 'lodash';
import { addType, StringExpression, } from '../../expression';
import { makeMessage, Message } from '../../message';
import { Token, TokenKind } from '../../token';
import { StringType } from '../../type/type';
import {
  UntypedExpression,
  UntypedStringExpression,
} from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { TypedScope } from '../../scope';
import { EvaluationScope } from '../../scope';
import { LazyValue, makeStringValue, StringValue } from '../../value';
import { Observable } from 'rxjs/Observable';


function makeStringExpression(token: Token, messages: Message[] = []): UntypedStringExpression {
  const value = token.value;
  const contents = last(value) === value[0]
    ? value.slice(1, -1)
    : value.slice(1);
  return {
    kind: 'String',
    tokens: [token],
    value: contents,
    messages,
  };
}

export function intepretString(tokens: Token[]): UntypedExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.StringLiteral)) {
    let messages: Message[] = [];
    let strToken = tokens[0];
    if (head(strToken.value) !== last(strToken.value)) {
      messages.push(makeMessage('Error', 'String literal is missing closing quote.', strToken.end));
    }
    return makeStringExpression(strToken, messages);
  }
}

export function typeString(scope: TypedScope, expression: UntypedStringExpression): StringExpression {
  return addType(expression, StringType);
}

export function evaluateString(scope: EvaluationScope, expression: StringExpression): LazyValue<StringValue> {
  return Observable.of(makeStringValue(expression.value));
}
