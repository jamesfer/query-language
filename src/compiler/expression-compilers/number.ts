import { FloatExpression, IntegerExpression, } from '../../expression';
import { makeMessage, Message } from '../../message';
import { Scope } from '../../scope';
import { Token, TokenKind, } from '../../token';
import { floatType, integerType } from '../../type/constructors';
import {
  UntypedFloatExpression,
  UntypedIntegerExpression,
} from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import {
  FloatValue, IntegerValue, LazyValue, makeLazyFloatValue,
  makeLazyIntegerValue,
} from '../../value';
import { toNumber } from 'lodash';


function makeFloatExpression(value: number, token: Token, messages: Message[] = []): UntypedFloatExpression {
  return {
    kind: 'Float',
    tokens: [token],
    value,
    messages,
  };
}

export function makeIntegerExpression(value: number, token: Token, messages: Message[] = []): UntypedIntegerExpression {
  return {
    kind: 'Integer',
    tokens: [token],
    value,
    messages,
  };
}

export function interpretNumber(tokens: Token[]): UntypedFloatExpression | UntypedIntegerExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.FloatLiteral)
    || tokenArrayMatches(tokens, TokenKind.IntegerLiteral)) {
    const token = tokens[0];
    const value = +token.value;

    let messages: Message[] = [];
    if (isNaN(value)) {
      messages.push(makeMessage('Error', 'Not a valid number.', token));
    }
    else if (value >= Number.MAX_VALUE) {
      messages.push(makeMessage('Error', 'Value is larger than the maximum value of ' + Number.MAX_VALUE, token));
    }
    else if (value <= Number.MIN_VALUE) {
      messages.push(makeMessage('Error', 'Value is smaller than the minimum value of ' + Number.MIN_VALUE, token));
    }

    if (token.kind === TokenKind.IntegerLiteral) {
      return makeIntegerExpression(value, token, messages);
    }
    return makeFloatExpression(value, token, messages);
  }
}

export function typeNumber(scope: Scope, expression: UntypedFloatExpression | UntypedIntegerExpression): IntegerExpression | FloatExpression {
  if (expression.kind === 'Integer') {
    return {
      ...expression,
      resultType: integerType,
    };
  }
  return {
    ...expression,
    resultType: floatType,
  }
}

export function evaluateInteger(scope: Scope, expression: IntegerExpression): LazyValue<IntegerValue> {
  return makeLazyIntegerValue(toNumber(expression.value));
}

export function evaluateFloat(scope: Scope, expression: FloatExpression): LazyValue<FloatValue> {
  return makeLazyFloatValue(toNumber(expression.value));
}
