import { TokenKind } from '../../qlang';
import {
  makeUntypedUnrecognizedExpression,
  UntypedFunctionExpression,
} from '../../untyped-expression';
import { tokenArrayMatches } from '../../utils';
import { Log } from '../compiler-utils/monoids/log';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';


export const interpretFunction: ExpressionInterpreter<UntypedFunctionExpression> = (incomingTokens) => {
  if (tokenArrayMatches(incomingTokens, TokenKind.Identifier)) {
    const log = Log.empty();
    // TODO support multiple arguments
    const argToken = incomingTokens[0];
    let tokens = incomingTokens.slice(1);
    if (tokenArrayMatches(tokens, TokenKind.FatArrow)) {
      const arrowToken = tokens[0];
      tokens = tokens.slice(1);

      const bodyExpression = log.combine(interpretExpression(tokens))
        || makeUntypedUnrecognizedExpression([]);
      return log.wrap<UntypedFunctionExpression>({
        kind: 'Function',
        arguments: [argToken],
        tokens: [argToken, arrowToken, ...bodyExpression.tokens],
        value: bodyExpression,
      });
    }
  }
  return Log.of(undefined);
};
