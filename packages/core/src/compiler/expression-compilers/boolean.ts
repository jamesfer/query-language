import { addType, BooleanExpression } from '../../expression';
import { Scope } from '../../scope';
import { TokenKind } from '../../token';
import { booleanType } from '../../type/constructors';
import { UntypedBooleanExpression } from '../../untyped-expression';
import { BooleanValue, LazyValue, makeBooleanValue } from '../../value';
import { Observable } from 'rxjs/Observable';
import { tokenArrayMatches } from '../../utils';
import { ExpressionInterpreter } from '../interpret-expression';
import { ExpressionTyper } from '../type-expression';


export const interpretBoolean: ExpressionInterpreter = (tokens) => {
  if (tokenArrayMatches(tokens, TokenKind.BooleanLiteral)) {
    const booleanToken = tokens[0];
    return {
      kind: 'Boolean',
      tokens: [booleanToken],
      messages: [],
      value: booleanToken.value === 'true',
    };
  }
  return undefined;
};

export const typeBoolean: ExpressionTyper<UntypedBooleanExpression> = (scope, typeVariables, expression) => {
  return [typeVariables, addType(expression, booleanType)];
};

export function evaluateBoolean(scope: Scope, expression: BooleanExpression)
: LazyValue<BooleanValue> {
  return Observable.of(makeBooleanValue(expression.value));
}
