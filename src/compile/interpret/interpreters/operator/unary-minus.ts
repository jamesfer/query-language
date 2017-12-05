import {
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../../../../untyped-expression.model';
import { Token, TokenKind } from '../../../../token.model';
import { tokenArrayMatches } from '../../../../utils';
import { buildExpression } from '../../interpret-expression';
import {
  makeFunctionCallExpression,
} from '../function-call';
import { makeIdentifierExpression } from '../identifier';
import { makeCustomNumericExpression } from '../literal/numeric';

const UnaryMinusPrecedence = 12;

export function buildUnaryMinusOperatorExpression(tokens: Token[], leftExpression: UntypedExpression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.SubtractOperator)
    && leftExpression === null
    && UnaryMinusPrecedence > operatorPrecedence
  ) {
    const rightExpression = buildExpression(tokens.slice(1), null, UnaryMinusPrecedence);
    if (rightExpression) {
      const identifierExpression = makeIdentifierExpression(tokens[0]);
      return makeFunctionCallExpression(identifierExpression, [
        makeCustomNumericExpression('0'),
        rightExpression,
      ]);
    }
  }
}
