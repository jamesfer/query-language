import { flatMap, sortBy, filter } from 'lodash';
import { UntypedExpression, UntypedFunctionCallExpression } from '../../../untyped-expression';
import { Message } from '../../../message';
import { Token, TokenKind } from '../../../token';
import { buildListInterpreter } from '../../compiler-utils/interpret-list';
import { normalizeMessageResult } from '../../compiler-utils/message-store';
import { ExpressionInterpreter } from '../../interpret-expression';

export const functionCallPrecedence = 100;

export function makeFunctionCallExpression(
  functionExpression: UntypedExpression,
  args: (UntypedExpression | any)[],
  messages: Message[] = [],
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
    messages,
    kind: 'FunctionCall',
  };
}

const buildArguments
  = buildListInterpreter(TokenKind.OpenParen, TokenKind.CloseParen, TokenKind.Comma);

export const interpretFunctionCall: ExpressionInterpreter = (tokens, left, precedence) => {
  if (precedence < functionCallPrecedence && left !== null) {
    const result = buildArguments(tokens);
    if (result) {
      const [args, messages] = result;
      return makeFunctionCallExpression(
        left,
        args.expressions,
        normalizeMessageResult(messages),
        args.tokens,
      );
    }
  }
  return undefined;
};
