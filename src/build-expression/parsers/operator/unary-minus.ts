import { Token, TokenKind } from '../../../token.model';
import { Expression } from '../../../expression.model';
import {
  FunctionCallExpression,
  makeFunctionCallExpression,
} from '../function-call';
import { tokenArrayMatches } from '../../../utils';
import { makeIdentifierExpression } from '../identifier';
import { makeCustomNumericLiteralExpression } from '../literal/numeric-literal';
import { buildExpression } from '../../build-expression';

const UnaryMinusPrecedence = 12;

export function buildUnaryMinusOperatorExpression(tokens: Token[], leftExpression: Expression | null, operatorPrecedence: number): FunctionCallExpression | undefined {
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
