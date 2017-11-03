import { ExpressionInterface } from '../../../expression.model';
import { Token } from '../../../token.model';

export interface UnrecognizedExpression extends ExpressionInterface<'Unrecognized'> {}

export function makeUnrecognizedExpression(tokens: Token[]): UnrecognizedExpression {
  return {
    kind: 'Unrecognized',
    tokens,
    messages: [],
  };
}
