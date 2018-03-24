import { UntypedExpression } from '../../../untyped-expression';
import { Token } from '../../../token';
import { firstResult } from '../../../utils';
import { interpretArraySliceOperator } from './array-slice-operator';
import { interpretInfixOperator } from './basic-infix-operator';
import { interpretRangeOperator } from './range-operator';
import { interpretUnaryMinusOperator } from './unary-minus-operator';


export function buildOperatorExpression(tokens: Token[], prevExpression: UntypedExpression | null, operatorPrecedence: number): UntypedExpression | undefined {
  return firstResult([
    interpretUnaryMinusOperator,
    interpretInfixOperator,
    interpretArraySliceOperator,
    interpretRangeOperator,
  ], tokens, prevExpression, operatorPrecedence);
}
