import { UntypedExpression } from '../../../untyped-expression.model';
import { Token } from '../../../token.model';
import { firstResult } from '../../../utils';
import { interpretArrayAccessOperator } from './array-access-operator';
import { interpretInfixOperator } from './basic-infix-operator';
import { interpretRangeOperator } from './range-operator';
import { interpretUnaryMinusOperator } from './unary-minus-operator';


export function buildOperatorExpression(tokens: Token[], prevExpression: UntypedExpression | null, operatorPrecedence: number): UntypedExpression | undefined {
  return firstResult([
    interpretUnaryMinusOperator,
    interpretInfixOperator,
    interpretArrayAccessOperator,
    interpretRangeOperator,
  ], tokens, prevExpression, operatorPrecedence);
}
