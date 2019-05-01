import { Scope } from '../../scope';
import { TokenKind } from '../../token';
import { BooleanExpression, ExpressionKind } from '../../type6Lazy/expression';
import { makeType } from '../../type6Lazy/type';
import { booleanType } from '../../type6Lazy/value-constructors';
import { UntypedBooleanExpression } from '../../untyped-expression';
import { BooleanValue, LazyValue, makeBooleanValue } from '../../value';
import { Observable } from 'rxjs/Observable';
import { tokenArrayMatches } from '../../utils';
import { LogTypeScope } from '../compiler-utils/monoids/log-type-scope';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper } from '../type-expression';
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

export const typeBoolean: ExpressionTyper<UntypedBooleanExpression> = (scope, inferredTypes, expression) => {
  return LogTypeScope.wrapWithVariables<BooleanExpression>(inferredTypes, {
    ...expression,
    kind: ExpressionKind.Boolean,
    resultType: makeType(async () => booleanType),
  });
};

export function evaluateBoolean(scope: Scope, expression: BooleanExpression)
: LazyValue<BooleanValue> {
  return Observable.of(makeBooleanValue(expression.value));
}
