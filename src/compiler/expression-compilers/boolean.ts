import { addType, BooleanExpression, } from '../../expression.model';
import { Token, TokenKind } from '../../token.model';
import { BooleanType } from '../../type.model';
import { UntypedBooleanExpression, } from '../../untyped-expression.model';
import { TypedScope } from '../typed-scope.model';
import { EvaluationScope } from '../evaluation-scope';
import { BooleanValue, LazyValue, makeBooleanValue } from '../../value.model';
import { Observable } from 'rxjs/Observable';
import { tokenArrayMatches } from '../../utils';

export function parseBooleanExpression(scope: TypedScope, expression: UntypedBooleanExpression): BooleanExpression {
  return addType(expression, BooleanType);
}

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

export function evaluateBooleanLiteral(scope: EvaluationScope, expression: BooleanExpression): LazyValue<BooleanValue> {
  return Observable.of(makeBooleanValue(expression.value));
}
