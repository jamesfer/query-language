import {
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../../../untyped-expression.model';
import { Token, TokenKind } from '../../../token.model';
import { tokenArrayMatches } from '../../../utils';
import { interpretExpression } from '../../interpret-expression';
import {
  makeFunctionCallExpression,
} from '../function/interpret-function-call';
import { makeIdentifierExpression } from '../identifier';

const UnaryMinusPrecedence = 12;

export function interpretUnaryMinusOperator(tokens: Token[], leftExpression: UntypedExpression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.SubtractOperator)
    && leftExpression === null
    && UnaryMinusPrecedence > operatorPrecedence
  ) {
    const rightExpression = interpretExpression(tokens.slice(1), null, UnaryMinusPrecedence);
    if (rightExpression) {
      const identifierExpression = makeIdentifierExpression(tokens[0]);
      const integerExpression = {
        kind: 'Integer',
        value: 0,
        tokens: [],
        messages: [],
      };

      return makeFunctionCallExpression(identifierExpression, [
        integerExpression,
        rightExpression,
      ]);
    }
  }
}
