import { head, last } from 'lodash';
import { makeMessage } from '../../message';
import { Token, TokenKind } from '../../token';
import { UntypedStringExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { Log } from '../compiler-utils/monoids/log';
import { ExpressionInterpreter } from '../interpret-expression';


function makeStringExpression(token: Token): UntypedStringExpression {
  const value = token.value;
  const contents = last(value) === value[0]
    ? value.slice(1, -1)
    : value.slice(1);
  return {
    kind: 'String',
    tokens: [token],
    value: contents,
  };
}

export const interpretString: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.StringLiteral)) {
    const log = Log.empty();
    const strToken = tokens[0];
    if (head(strToken.value) !== last(strToken.value)) {
      log.push(makeMessage('Error', 'String literal is missing closing quote.', strToken.end));
    }
    return log.wrap(makeStringExpression(strToken));
  }
  return Log.of(undefined);
};
