import { ExpressionInterpreter, interpretExpression } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function-call';
import { makeIdentifierExpression } from '../identifier';
import { hasHigherPrecedence, precedences } from './precedences';
import { Log } from '../../compiler-utils/monoids/log';

export const interpretInfixOperator: ExpressionInterpreter = (tokens, left, precedence) => {
  const opToken = tokens[0];
  const matchingOp = precedences[opToken.kind];

  if (matchingOp && hasHigherPrecedence(matchingOp, precedence)) {
    const log = Log.empty();
    const identifierExpression = makeIdentifierExpression(opToken);
    const rightExpression = log.combine(interpretExpression(
      tokens.slice(1),
      null,
      matchingOp.precedence,
    ));

    return log.wrap(makeFunctionCallExpression(identifierExpression, [
      left,
      rightExpression,
    ]));
  }
  return Log.of(undefined);
};
