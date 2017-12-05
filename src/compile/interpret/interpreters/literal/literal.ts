import { UntypedExpression } from '../../../../untyped-expression.model';
import { Token } from '../../../../token.model';
import { firstResult } from '../../../../utils';
import { buildArrayExpression } from './array';
import { buildNumericExpression } from './numeric';
import { buildStringExpression } from './string';

export function buildLiteralExpression(tokens: Token[], prevExpression: UntypedExpression | null, operatorPrecedence: number): UntypedExpression | undefined {
  if (prevExpression === null) {
    return firstResult([
      buildStringExpression,
      buildNumericExpression,
      buildArrayExpression,
    ], tokens)
  }
}
