import { addType, BooleanExpression, } from '../../expression';
import { Scope } from '../../scope';
import { Token, TokenKind } from '../../token';
import { booleanType } from '../../type/constructors';
import { UntypedBooleanExpression, } from '../../untyped-expression';
import { BooleanValue, LazyValue, makeBooleanValue } from '../../value';
import { Observable } from 'rxjs/Observable';
import { tokenArrayMatches } from '../../utils';


export function interpretBoolean(tokens: Token[]): UntypedBooleanExpression | undefined {
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

export function typeBoolean(scope: Scope, expression: UntypedBooleanExpression): BooleanExpression {
  return addType(expression, booleanType);
}

export function evaluateBoolean(scope: Scope, expression: BooleanExpression): LazyValue<BooleanValue> {
  return Observable.of(makeBooleanValue(expression.value));
}
