import { Token, TokenKind } from '../../token.model';
import { Expression, ExpressionInterface } from '../../expression.model';
import { tokenArrayMatches } from '../../utils';
import { buildExpression } from '../build-expression';
import { sortBy, flatten, map } from 'lodash';
import { makeMessage, Message } from '../../message.model';

export const FunctionCallPrecedence = 100;

export interface FunctionCallExpression extends ExpressionInterface<'FunctionCall'> {
  functionExpression: Expression;
  args: (Expression | null)[];
}

export function makeFunctionCallExpression(functionExpression: Expression, args: (Expression | null)[], extraTokens: Token[] = [], messages: Message[] = []): FunctionCallExpression {
  let tokens: Token[] = sortBy([
    ...functionExpression.tokens,
    ...flatten(map(args, arg => arg ? arg.tokens : [])),
    ...extraTokens,
  ], 'begin');

  return {
    kind: 'FunctionCall',
    functionExpression,
    args,
    tokens,
    messages,
  };
}

export function buildFunctionCallExpression(tokens: Token[], prevExpression: Expression | null, operatorPrecedence: number): FunctionCallExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.OpenParen) && operatorPrecedence < FunctionCallPrecedence && prevExpression !== null) {
    let extraTokens = [tokens[0]];
    tokens = tokens.slice(1);

    let args: Expression[] = [];
    let messages: Message[] = [];
    while (!tokenArrayMatches(tokens, TokenKind.CloseParen)) {
      let nextArg = buildExpression(tokens);
      tokens = tokens.slice(nextArg.tokens.length);
      args.push(nextArg);

      if (nextArg.kind === 'Unrecognized') {
        messages.push(makeMessage('Error', 'Malformed expression passed to function.'));
        break;
      }

      if (tokenArrayMatches(tokens, TokenKind.Comma)) {
        extraTokens.push(tokens[0]);
        tokens = tokens.slice(1);
      }
      else if (!tokenArrayMatches(tokens, TokenKind.CloseParen)) {
        messages.push(makeMessage('Error', 'Missing comma between arguments.'));
      }
    }
    if (tokenArrayMatches(tokens, TokenKind.CloseParen)) {
      extraTokens.push(tokens[0]);
    }

    return makeFunctionCallExpression(prevExpression, args, extraTokens, messages);
  }
}
