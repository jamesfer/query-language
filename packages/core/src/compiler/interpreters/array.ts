import { makeMessage } from '../../message';
import { TokenKind } from '../../token';
import { UntypedArrayExpression } from '../../untyped-expression';
import { buildListInterpreter } from '../compiler-utils/interpret-list';
import { Log } from '../compiler-utils/monoids/log';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper, typeExpression } from '../type-expression';


const buildArrayList
  = buildListInterpreter(TokenKind.OpenBracket, TokenKind.CloseBracket, TokenKind.Comma);

export const interpretArray: ExpressionInterpreter = (tokens) => {
  const log = Log.empty();
  const result = log.combine(buildArrayList(tokens));
  if (result) {
    return log.wrap<UntypedArrayExpression>({
      kind: 'Array',
      elements: result.expressions,
      tokens: result.tokens,
    });
  }
  return Log.of(undefined);
};
