import { Expression } from '../../../../expression.model';
import { Token } from '../../../../token.model';
import { firstResult } from '../../../../utils';
import { buildStringLiteralExpression } from './string-literal';
import { buildNumericLiteralExpression } from './numeric-literal';
import { buildArrayLiteralExpression } from './array-literal';

export function buildLiteralExpression(tokens: Token[], prevExpression: Expression | null, operatorPrecedence: number): Expression | undefined {
  if (prevExpression === null) {
    return firstResult([
      buildStringLiteralExpression,
      buildNumericLiteralExpression,
      buildArrayLiteralExpression,
    ], tokens)
  }
}
