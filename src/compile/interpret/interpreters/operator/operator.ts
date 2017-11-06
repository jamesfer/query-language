import { Expression } from '../../../../expression.model';
import { Token } from '../../../../token.model';
import { firstResult } from '../../../../utils';
import { buildArrayAccessOperatorExpression } from './array-access-operator';
import { buildInfixOperatorExpression } from './basic-infix-operator';
import { buildRangeOperatorExpression } from './range-operator';
import { buildUnaryMinusOperatorExpression } from './unary-minus';


export function buildOperatorExpression(tokens: Token[], prevExpression: Expression | null, operatorPrecedence: number): Expression | undefined {
  return firstResult([
    buildUnaryMinusOperatorExpression,
    buildInfixOperatorExpression,
    buildArrayAccessOperatorExpression,
    buildRangeOperatorExpression,
  ], tokens, prevExpression, operatorPrecedence);
}
