import { head, last } from 'lodash';
import { addType, StringExpression, } from '../../expression.model';
import { makeMessage, Message } from '../../message.model';
import { Token, TokenKind } from '../../token.model';
import { StringType } from '../../type.model';
import {
  UntypedExpression,
  UntypedStringExpression,
} from '../../untyped-expression.model';
import { tokenArrayMatches } from '../../utils';
import { TypedScope } from '../typed-scope.model';
import { EvaluationScope } from '../evaluation-scope';
import { LazyValue, makeStringValue, StringValue } from '../../value.model';
import { Observable } from 'rxjs/Observable';

export function parseStringExpression(scope: TypedScope, expression: UntypedStringExpression): StringExpression {
  return addType(expression, StringType);
}

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

export function buildStringExpression(tokens: Token[]): UntypedExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.StringLiteral)) {
    let messages: Message[] = [];
    let strToken = tokens[0];
    if (head(strToken.value) !== last(strToken.value)) {
      messages.push(makeMessage('Error', 'String literal is missing closing quote.'));
    }
    return makeStringExpression(strToken, messages);
  }
}

export function evaluateStringLiteral(scope: EvaluationScope, expression: StringExpression): LazyValue<StringValue> {
  return Observable.of(makeStringValue(expression.value));
}
