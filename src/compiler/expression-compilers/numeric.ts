import { FloatExpression, IntegerExpression, } from '../../expression.model';
import { makeMessage, Message } from '../../message.model';
import { Token, TokenKind, } from '../../token.model';
import { FloatType, IntegerType } from '../../type.model';
import {
  UntypedFloatExpression,
  UntypedIntegerExpression,
} from '../../untyped-expression.model';
import { tokenArrayMatches } from '../../utils';
import {
  FloatValue, IntegerValue, LazyValue, makeLazyFloatValue,
  makeLazyIntegerValue,
} from '../../value.model';
import { EvaluationScope } from '../evaluation-scope';
import { TypedScope } from '../typed-scope.model';
import { toNumber } from 'lodash';

export function parseNumericExpression(scope: TypedScope, expression: UntypedFloatExpression | UntypedIntegerExpression): IntegerExpression | FloatExpression {
  if (expression.kind === 'Integer') {
    return {
      ...expression,
      resultType: IntegerType,
    };
  }
  return {
    ...expression,
    resultType: FloatType,
  }
}

function makeFloatExpression(value: number, token: Token, messages: Message[] = []): UntypedFloatExpression {
  return {
    kind: 'Float',
    tokens: [token],
    value,
    messages,
  };
}

function makeIntegerExpression(value: number, token: Token, messages: Message[] = []): UntypedIntegerExpression {
  return {
    kind: 'Integer',
    tokens: [token],
    value,
    messages,
  };
}

export function buildNumericExpression(tokens: Token[]): UntypedFloatExpression | UntypedIntegerExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.FloatLiteral)
    || tokenArrayMatches(tokens, TokenKind.IntegerLiteral)) {
    const token = tokens[0];
    const value = +token.value;

    let messages: Message[] = [];
    if (isNaN(value)) {
      messages.push(makeMessage('Error', 'Not a valid number.'));
    }
    else if (value >= Number.MAX_VALUE) {
      messages.push(makeMessage('Error', 'Value is larger than the maximum value of ' + Number.MAX_VALUE));
    }
    else if (value <= Number.MIN_VALUE) {
      messages.push(makeMessage('Error', 'Value is smaller than the minimum value of ' + Number.MIN_VALUE));
    }

    if (token.kind === TokenKind.IntegerLiteral) {
      return makeIntegerExpression(value, token, messages);
    }
    return makeFloatExpression(value, token, messages);
  }
}

export function evaluateIntegerLiteral(scope: EvaluationScope, expression: IntegerExpression): LazyValue<IntegerValue> {
  return makeLazyIntegerValue(toNumber(expression.value));
}

export function evaluateFloatLiteral(scope: EvaluationScope, expression: FloatExpression): LazyValue<FloatValue> {
  return makeLazyFloatValue(toNumber(expression.value));
}
