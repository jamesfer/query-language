import { filter, flatMap, sortBy } from 'lodash';
import { Token, TokenKind } from '../../../token';
import { UntypedExpression, UntypedFunctionCallExpression } from '../../../untyped-expression';
import { buildListInterpreter } from '../../compiler-utils/interpret-list';
import { Log } from '../../compiler-utils/monoids/log';
import { ExpressionInterpreter } from '../../interpret-expression';

export const functionCallPrecedence = 100;

export function makeFunctionCallExpression(
  functionExpression: UntypedExpression,
  args: (UntypedExpression | any)[],
  argTokens?: Token[],
): UntypedFunctionCallExpression {
  const unsortedTokens = [
    ...functionExpression.tokens,
    ...argTokens || flatMap(filter(args), 'tokens'),
  ];
  const tokens: Token[] = sortBy(unsortedTokens, 'begin[1]');
  return {
    functionExpression,
    args,
    tokens,
    kind: 'FunctionCall',
  };
}

const buildArguments
  = buildListInterpreter(TokenKind.OpenParen, TokenKind.CloseParen, TokenKind.Comma);

export const interpretFunctionCall: ExpressionInterpreter = (tokens, left, precedence) => {
  if (precedence < functionCallPrecedence && left !== null) {
    const log = Log.empty();
    const result = log.combine(buildArguments(tokens));
    if (result) {
      return log.wrap(makeFunctionCallExpression(
        left,
        result.expressions,
        result.tokens,
      ));
    }
  }
  return Log.of(undefined);
};
