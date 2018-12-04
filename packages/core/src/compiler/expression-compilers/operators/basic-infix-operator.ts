import { Token } from '../../../token';
import { UntypedExpression, UntypedFunctionCallExpression } from '../../../untyped-expression';
import { interpretExpression } from '../../interpret-expression';
import { makeFunctionCallExpression } from '../function-call/interpret-function-call';
import { makeIdentifierExpression } from '../identifier';
import { hasHigherPrecedence, precedences } from './precedences';


export function interpretInfixOperator(
  tokens: Token[],
  leftExpression: UntypedExpression | null,
  prevPrecedence: number,
): UntypedFunctionCallExpression | undefined {
  const opToken = tokens[0];
  const matchingOp = precedences[opToken.kind];

  if (matchingOp && hasHigherPrecedence(matchingOp, prevPrecedence)) {
    const identifierExpression = makeIdentifierExpression(opToken);
    const rightExpression = interpretExpression(
      tokens.slice(1),
      null,
      matchingOp.precedence,
    );

    return makeFunctionCallExpression(identifierExpression, [
      leftExpression,
      rightExpression,
    ]);
  }
}
