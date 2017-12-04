import {
  Expression,
  UntypedFunctionCallExpression,
} from '../../../../untyped-expression.model';
import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';
import { buildExpression } from '../../interpret-expression';
import {
  makeFunctionCallExpression,
} from '../function-call';
import { makeIdentifierExpression } from '../identifier';
import { makeCustomNumericLiteralExpression } from '../literal/numeric-literal';

const UnaryMinusPrecedence = 12;

export function buildUnaryMinusOperatorExpression(tokens: Token[], leftExpression: Expression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.SubtractOperator)
    && leftExpression === null
    && UnaryMinusPrecedence > operatorPrecedence
  ) {
    const rightExpression = buildExpression(tokens.slice(1), null, UnaryMinusPrecedence);
    if (rightExpression) {
      const identifierExpression = makeIdentifierExpression(tokens[0]);
      return makeFunctionCallExpression(identifierExpression, [
        makeCustomNumericLiteralExpression('0'),
        rightExpression,
      ]);
    }
  }
}
