import { ExpressionInterface } from '../../../expression.model';

export interface NoneExpression extends ExpressionInterface<'NoneLiteral'> { }

export function makeNoneExpression(): NoneExpression {
  return {
    kind: 'NoneLiteral',
    tokens: [],
    messages: [],
  };
}
