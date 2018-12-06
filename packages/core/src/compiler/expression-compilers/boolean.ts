import { addType, BooleanExpression } from '../../expression';
import { Scope } from '../../scope';
import { TokenKind } from '../../token';
import { booleanType } from '../../type/constructors';
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

export const typeBoolean: ExpressionTyper<UntypedBooleanExpression> = (scope, typeVariables, expression) => {
  return LogTypeScope.wrapWithVariables(typeVariables, addType(expression, booleanType));
};

export function evaluateBoolean(scope: Scope, expression: BooleanExpression)
: LazyValue<BooleanValue> {
  return Observable.of(makeBooleanValue(expression.value));
}
