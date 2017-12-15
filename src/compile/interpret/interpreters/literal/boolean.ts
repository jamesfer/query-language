import { Token, TokenKind } from '../../../../token.model';
import { UntypedBooleanExpression } from '../../../../untyped-expression.model';
import { tokenArrayMatches } from '../../../../utils';

export function buildBooleanExpression(tokens: Token[]): UntypedBooleanExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.BooleanLiteral)) {
    let booleanToken = tokens[0];
    return {
      kind: 'Boolean',
      tokens: [booleanToken],
      messages: [],
      value: booleanToken.value === 'true',
    };
  }
}
