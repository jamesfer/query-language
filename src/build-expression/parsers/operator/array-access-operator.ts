import { Token, TokenKind } from '../../../token.model';
import { FunctionCallExpression, makeFunctionCallExpression } from '../function-call';
import { Expression } from '../../../expression.model';
import { tokenArrayMatches } from '../../../utils';
import { makeCustomIdentifierExpression } from '../identifier';
import { buildExpression } from '../../build-expression';
import { makeNoneExpression } from '../none';
import { last, every } from 'lodash';
import { makeMessage, Message } from '../../../message.model';

const ArrayAccessPrecedence = 12;

export function buildArrayAccessOperatorExpression(tokens: Token[], leftExpression: Expression | null, operatorPrecedence: number): FunctionCallExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.OpenBracket) && leftExpression && operatorPrecedence < ArrayAccessPrecedence) {
    let additionalTokens: Token[] = [tokens[0]];
    tokens = tokens.slice(1);

    // Build arguments
    let index = -1;
    let args: Expression[] = Array(3);
    let messages: Message[] = [];
    while (++index < 3) {
      if (tokenArrayMatches(tokens, TokenKind.CloseBracket)) {
        args[index] = makeNoneExpression();
      }
      else if (index < 2 && tokenArrayMatches(tokens, TokenKind.Colon)) {
        additionalTokens.push(tokens[0]);
        tokens = tokens.slice(1);
        args[index] = makeNoneExpression();
      }
      else {
        args[index] = buildExpression(tokens);

        if (tokenArrayMatches(tokens, index < 2 ? TokenKind.Colon : TokenKind.CloseBracket)) {
          additionalTokens.push(tokens[0]);
          tokens = tokens.slice(1);
        }
      }
    }

    // Check if the expression ended with a bracket
    if (last(additionalTokens)!.kind !== TokenKind.CloseBracket) {
      messages.push(makeMessage('Error', 'Missing closing bracket of array access expression.'));
    }

    // Check if any indexes were given
    if (every(args, arg => arg.kind === 'NoneLiteral')) {
      messages.push(makeMessage('Warning', 'No indexes were supplied to array access expression. Remove the brackets to simplify.'));
    }

    const identifier = makeCustomIdentifierExpression('[]', [additionalTokens[0]]);
    return makeFunctionCallExpression(identifier, args, additionalTokens.slice(1), messages);
  }
}



