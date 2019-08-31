import { TokenKind } from '../../token';
import { UntypedBooleanExpression } from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { ExpressionInterpreter } from '../interpret-expression';
import { Log } from '../compiler-utils/monoids/log';


export const interpretBoolean: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.BooleanLiteral)) {
    const booleanToken = tokens[0];
    return Log.of<UntypedBooleanExpression>({
      kind: 'Boolean',
      tokens: [booleanToken],
      value: booleanToken.value === 'true',
    });
  }
  return Log.of(undefined);
};
