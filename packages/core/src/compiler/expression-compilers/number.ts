import { FloatExpression, IntegerExpression } from '../../expression';
import { makeMessage, Message } from '../../message';
import { Scope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { floatType, integerType } from '../../type/constructors';
import { UntypedFloatExpression, UntypedIntegerExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import {
  FloatValue,
  IntegerValue,
  LazyValue,
  makeLazyFloatValue,
  makeLazyIntegerValue,
} from '../../value';
import { toNumber, isNaN } from 'lodash';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper } from '../type-expression';


function makeFloatExpression(value: number, token: Token, messages: Message[] = [])
: UntypedFloatExpression {
  return {
    value,
    messages,
    kind: 'Float',
    tokens: [token],
  };
}

export function makeIntegerExpression(value: number, token: Token, messages: Message[] = [])
: UntypedIntegerExpression {
  return {
    value,
    messages,
    kind: 'Integer',
    tokens: [token],
  };
}

export const interpretNumber: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.FloatLiteral)
    || tokenArrayMatches(tokens, TokenKind.IntegerLiteral)) {
    const token = tokens[0];
    const value = +token.value;

    const messages: Message[] = [];
    if (isNaN(value)) {
      messages.push(makeMessage('Error', 'Not a valid number.', token));
    } else if (value === Infinity || value === -Infinity) {
      const message = 'Value cannot be represented as a number.';
      messages.push(makeMessage('Error', message, token));
    }

    if (token.kind === TokenKind.IntegerLiteral) {
      return makeIntegerExpression(value, token, messages);
    }
    return makeFloatExpression(value, token, messages);
  }
  return undefined;
};

export const typeNumber: ExpressionTyper<UntypedFloatExpression | UntypedIntegerExpression> = (
  scope,
  typeVariables,
  expression,
) => {
  // The expression is written this way because typescript doesn't understand it if the ternary is
  // inside the object literal.
  const numberExpression = expression.kind === 'Integer'
    ? { ...expression, resultType: integerType }
    : { ...expression, resultType: floatType };
  return [typeVariables, numberExpression];
};

export function evaluateInteger(scope: Scope, expression: IntegerExpression)
: LazyValue<IntegerValue> {
  return makeLazyIntegerValue(toNumber(expression.value));
}

export function evaluateFloat(scope: Scope, expression: FloatExpression)
: LazyValue<FloatValue> {
  return makeLazyFloatValue(toNumber(expression.value));
}
