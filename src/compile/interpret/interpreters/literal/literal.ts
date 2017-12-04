import { Expression } from '../../../../untyped-expression.model';
import { Token } from '../../../../token.model';
import { firstResult } from '../../../../utils';
import { buildArrayLiteralExpression } from './array-literal';
import { buildNumericLiteralExpression } from './numeric-literal';
import { buildStringLiteralExpression } from './string-literal';

export function buildLiteralExpression(tokens: Token[], prevExpression: Expression | null, operatorPrecedence: number): Expression | undefined {
  if (prevExpression === null) {
    return firstResult([
      buildStringLiteralExpression,
      buildNumericLiteralExpression,
      buildArrayLiteralExpression,
    ], tokens)
  }
}
