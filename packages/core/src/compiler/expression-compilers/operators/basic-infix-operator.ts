import { ExpressionInterpreter, interpretExpression } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function-call/interpret-function-call';
import { makeIdentifierExpression } from '../identifier';
import { hasHigherPrecedence, precedences } from './precedences';


export const interpretInfixOperator: ExpressionInterpreter = (tokens, left, precedence) => {
  const opToken = tokens[0];
  const matchingOp = precedences[opToken.kind];

  if (matchingOp && hasHigherPrecedence(matchingOp, precedence)) {
    const identifierExpression = makeIdentifierExpression(opToken);
    const rightExpression = interpretExpression(
      tokens.slice(1),
      null,
      matchingOp.precedence,
    );

    return makeFunctionCallExpression(identifierExpression, [
      left,
      rightExpression,
    ]);
  }
  return undefined;
};
