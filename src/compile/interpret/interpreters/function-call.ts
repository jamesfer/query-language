import { Token, TokenKind } from '../../../token.model';
import { Expression, ExpressionInterface } from '../../../expression.model';
import { sortBy, reduce, flatten, map } from 'lodash';
import { Message } from '../../../message.model';
import { buildList } from './util/list';
import { interleaveTokens } from './util/interleave-tokens';

export const FunctionCallPrecedence = 100;

export interface FunctionCallExpression extends ExpressionInterface<'FunctionCall'> {
  functionExpression: Expression;
  args: (Expression | null)[];
}

export function makeFunctionCallExpression(functionExpression: Expression, args: (Expression | null)[], argTokens?: Token[], messages: Message[] = []): FunctionCallExpression {
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

export function buildFunctionCallExpression(tokens: Token[], prevExpression: Expression | null, operatorPrecedence: number): FunctionCallExpression | undefined {
  if (operatorPrecedence < FunctionCallPrecedence && prevExpression !== null) {
    let args = buildArguments(tokens);
    if (args) {
      return makeFunctionCallExpression(prevExpression, args.expressions, args.tokens, args.messages);
    }
  }
}
