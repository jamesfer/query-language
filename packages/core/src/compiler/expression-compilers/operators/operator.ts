import { firstResult } from '../../../utils';
import { ExpressionInterpreter } from '../../interpret-expression';
import { interpretArraySliceOperator } from './array-slice-operator';
import { interpretInfixOperator } from './basic-infix-operator';
import { interpretRangeOperator } from './range-operator';
import { interpretUnaryMinusOperator } from './unary-minus-operator';


export const interpretOperatorExpression: ExpressionInterpreter = (tokens, left, precedences) => {
  const interpreters = [
    interpretUnaryMinusOperator,
    interpretInfixOperator,
    interpretArraySliceOperator,
    interpretRangeOperator,
  ];
  return firstResult(interpreters, tokens, left, precedences);
};
