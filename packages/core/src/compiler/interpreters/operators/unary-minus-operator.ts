import { TokenKind } from '../../../token';
import { tokenArrayMatches } from '../../../utils';
import { ExpressionInterpreter, interpretExpression } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function-call';
import { makeIdentifierExpression } from '../identifier';
import { hasHigherPrecedence, precedences } from './precedences';
import { Log } from '../../compiler-utils/monoids/log';

export const interpretUnaryMinusOperator: ExpressionInterpreter = (tokens, left, precedence) => {
  if (tokenArrayMatches(tokens, TokenKind.SubtractOperator)
    && left === null
    && hasHigherPrecedence(precedences.unaryMinus, precedence)
  ) {
    const log = Log.empty();
    const rightExpression = log.combine(interpretExpression(
      tokens.slice(1),
      null,
      precedences.unaryMinus.precedence,
    ));

    if (rightExpression) {
      const identifierExpression = makeIdentifierExpression(tokens[0]);
      const integerExpression = {
        kind: 'Integer',
        value: 0,
        tokens: [],
      };

      return log.wrap(makeFunctionCallExpression(identifierExpression, [
        integerExpression,
        rightExpression,
      ]));
    }
  }
  return Log.of(undefined);
};
