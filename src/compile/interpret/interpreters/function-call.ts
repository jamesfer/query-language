import { reduce, sortBy } from 'lodash';
import {
  UntypedExpression,
  UntypedFunctionCallExpression,
} from '../../../untyped-expression.model';
import { Message } from '../../../message.model';
import { Token, TokenKind } from '../../../token.model';
import { buildList } from './util/list';

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

let buildArguments = buildList(TokenKind.OpenParen, TokenKind.CloseParen, TokenKind.Comma);

export function buildFunctionCallExpression(tokens: Token[], prevExpression: UntypedExpression | null, operatorPrecedence: number): UntypedFunctionCallExpression | undefined {
  if (operatorPrecedence < FunctionCallPrecedence && prevExpression !== null) {
    let args = buildArguments(tokens);
    if (args) {
      return makeFunctionCallExpression(prevExpression, args.expressions, args.messages, args.tokens);
    }
  }
}
