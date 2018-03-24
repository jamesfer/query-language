import { reduce, sortBy } from 'lodash';
import {
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../../../untyped-expression';
import { Message } from '../../../message';
import { Token, TokenKind } from '../../../token';
import { buildListInterpreter } from '../../compiler-utils/interpret-list';
import { normalizeMessageResult } from '../../compiler-utils/message-store';

export const FunctionCallPrecedence = 100;

export function makeFunctionCallExpression(functionExpression: UntypedExpression, args: (UntypedExpression | any)[], messages: Message[] = [], argTokens?: Token[]): UntypedFunctionCallExpression {
  if (!argTokens) {
    argTokens = reduce(args, (tokens, arg) => {
      return arg ? [...tokens, ...arg.tokens] : tokens;
    }, []);
  }

  let tokens: Token[] = sortBy([
    ...functionExpression.tokens,
    ...argTokens,
  ], 'begin');

  return {
    kind: 'FunctionCall',
    functionExpression,
    args,
    tokens,
    messages,
  };
}

let buildArguments = buildListInterpreter(TokenKind.OpenParen, TokenKind.CloseParen, TokenKind.Comma);

export function interpretFunctionCall(tokens: Token[], prevExpression: UntypedExpression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (operatorPrecedence < FunctionCallPrecedence && prevExpression !== null) {
    let result = buildArguments(tokens);
    if (result) {
      const [ args, messages ] = result;
      return makeFunctionCallExpression(
        prevExpression,
        args.expressions,
        normalizeMessageResult(messages), 
        args.tokens
      );
    }
  }
}
