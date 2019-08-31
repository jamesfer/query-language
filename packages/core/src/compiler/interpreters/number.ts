import { isNaN } from 'lodash';
import { makeMessage } from '../../message';
import { Token, TokenKind } from '../../token';
import { UntypedFloatExpression, UntypedIntegerExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { Log } from '../compiler-utils/monoids/log';
import { ExpressionInterpreter } from '../interpret-expression';


function makeFloatExpression(value: number, token: Token): UntypedFloatExpression {
  return {
    value,
    kind: 'Float',
    tokens: [token],
  };
}

export function makeIntegerExpression(value: number, token: Token): UntypedIntegerExpression {
  return {
    value,
    kind: 'Integer',
    tokens: [token],
  };
}

export const interpretNumber: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.FloatLiteral)
    || tokenArrayMatches(tokens, TokenKind.IntegerLiteral)) {
    const log = Log.empty();
    const token = tokens[0];
    const value = +token.value;

    if (isNaN(value)) {
      log.push(makeMessage('Error', 'Not a valid number.', token));
    } else if (value === Infinity || value === -Infinity) {
      const message = 'Value cannot be represented as a number.';
      log.push(makeMessage('Error', message, token));
    }

    if (token.kind === TokenKind.IntegerLiteral) {
      return log.wrap(makeIntegerExpression(value, token));
    }
    return log.wrap(makeFloatExpression(value, token));
  }
  return Log.of(undefined);
};
