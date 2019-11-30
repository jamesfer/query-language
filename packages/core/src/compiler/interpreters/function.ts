import { flatMap } from 'lodash';
import { TokenKind } from '../../qlang';
import {
  UntypedFunctionExpression,
} from '../../untyped-expression';
import {
  assignType,
  bindInterpreter,
  matchList,
  matchOneOf,
  matchSome,
  matchToken,
  matchAll,
} from '../compiler-utils/matchers';
import { Log } from '../compiler-utils/monoids/log';
import { lazy } from '../compiler-utils/utils';
import { ExpressionInterpreter, interpretExpression } from '../interpret-expression';

export const interpretFunction: ExpressionInterpreter<UntypedFunctionExpression> = lazy(() => bindInterpreter(
  matchAll([
    matchOneOf([
      assignType<'list'>('list')(
        matchList(
          matchToken(TokenKind.OpenParen),
          matchToken(TokenKind.Identifier),
          matchToken(TokenKind.Comma),
          matchToken(TokenKind.CloseParen),
          'Missing comma in function parameter list',
          'Missing parameter name in function parameter list',
          'Missing closing parenthesis in function parameter list',
        ),
      ),
      assignType<'token'>('token')(matchToken(TokenKind.Identifier)),
    ]),
    matchToken(TokenKind.FatArrow),
    interpretExpression,
  ]),
  ({
    tokens,
    results: [
      parameters,
      _,
      body,
    ],
  }) => Log.of<UntypedFunctionExpression | undefined>(!parameters || !body ? undefined : {
    tokens,
    kind: 'Function',
    arguments: parameters.type === 'list'
      ? flatMap(parameters.items, 'tokens')
      : parameters.tokens,
    value: body,
  }),
));

// export const interpretFunction: ExpressionInterpreter<UntypedFunctionExpression> = (incomingTokens) => {
//   if (tokenArrayMatches(incomingTokens, TokenKind.Identifier)) {
//     const log = Log.empty();
//     // TODO support multiple arguments
//     const argToken = incomingTokens[0];
//     let tokens = incomingTokens.slice(1);
//     if (tokenArrayMatches(tokens, TokenKind.FatArrow)) {
//       const arrowToken = tokens[0];
//       tokens = tokens.slice(1);
//
//       const bodyExpression = log.combine(interpretExpression(tokens))
//         || makeUntypedUnrecognizedExpression([]);
//       return log.wrap<UntypedFunctionExpression>({
//         kind: 'Function',
//         arguments: [argToken],
//         tokens: [argToken, arrowToken, ...bodyExpression.tokens],
//         value: bodyExpression,
//       });
//     }
//   }
//   return Log.of(undefined);
// };
