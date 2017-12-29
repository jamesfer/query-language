import {
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../../../untyped-expression';
import { Token, TokenKind } from '../../../token';
import { tokenArrayMatches } from '../../../utils';
import { interpretExpression } from '../../interpret-expression';
import {
  makeFunctionCallExpression,
} from '../function/interpret-function-call';
import { makeIdentifierExpression } from '../identifier';
import { hasHigherPrecedence, precedences } from './precedences';


export function interpretUnaryMinusOperator(tokens: Token[], leftExpression: UntypedExpression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.SubtractOperator)
    && leftExpression === null
    && hasHigherPrecedence(precedences.unaryMinus, operatorPrecedence)
  ) {
    const rightExpression = interpretExpression(
      tokens.slice(1),
      null,
      precedences.unaryMinus.precedence,
    );

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
