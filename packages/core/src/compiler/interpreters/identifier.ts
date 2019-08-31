import { Token, TokenKind } from '../../token';
import { UntypedIdentifierExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { Log } from '../compiler-utils/monoids/log';
import { ExpressionInterpreter } from '../interpret-expression';


export function makeIdentifierExpression(token: Token): UntypedIdentifierExpression {
  return makeCustomIdentifierExpression(token.value, [token]);
}

export function makeCustomIdentifierExpression(
  name: string,
  tokens: Token[],
): UntypedIdentifierExpression {
  return {
    tokens,
    kind: 'Identifier',
    value: name,
  };
}

export const interpretIdentifier: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.Identifier)) {
    return Log.of(makeIdentifierExpression(tokens[0]));
  }
  return Log.of(undefined);
};
