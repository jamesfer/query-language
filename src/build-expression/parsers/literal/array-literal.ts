import { Token, TokenKind } from '../../../token.model';
import { tokenArrayMatches } from '../../../utils';
import { Expression, ExpressionInterface } from '../../../expression.model';
import { buildExpression } from '../../build-expression';
import { sortBy, sum, map } from 'lodash';
import { makeMessage, Message } from '../../../message.model';

export interface ArrayLiteralExpression extends ExpressionInterface<'ArrayLiteral'> {
  elements: Expression[];
}

function arrayInsert<T>(array: T[], index: number, elements: T[]) {
  let i = -1;
  while (++i < elements.length) {
    array[index + i] = elements[i];
  }
}

function makeArrayLiteralExpression(elements: Expression[], extraTokens: Token[] = [], messages: Message[] = []) : ArrayLiteralExpression {
  // Attempt to combine tokens so that they require minimal resorting.
  const length = sum(map(elements, el => el.tokens.length)) + extraTokens.length;
  let tokens: Token[] = Array(length);
  let i = -1;
  let tokenIndex = 0;
  while (++i < elements.length) {
    // Insert the extra token first as this is likely the [ or ,
    if (i < extraTokens.length) {
      tokens[tokenIndex] = extraTokens[i];
      tokenIndex += 1;
    }

    // The follow it with the tokens of that element
    arrayInsert(tokens, tokenIndex, elements[i].tokens);
    tokenIndex += elements[i].tokens.length;
  }

  // Insert any remaining extra tokens. Eg. the last ]
  arrayInsert(tokens, tokenIndex, extraTokens.slice(i));

  // let extraI = 0;
  // let elementI = 0;
  // while (i < length) {
  //   if (extraI < extraTokens.length) {
  //     tokens[i] = extraTokens[extraI];
  //     extraI += 1;
  //     i += 1;
  //   }
  //
  //   if (elementI < elements.length) {
  //     let tokenI = -1;
  //     const tokenCount = elements[elementI].tokens.length;
  //     while (++tokenI < tokenCount) {
  //       tokens[i] = elements[elementI].tokens[tokenI];
  //       tokenI += 1;
  //       i += 1;
  //     }
  //     elementI += 1;
  //   }
  // }

  return {
    kind: 'ArrayLiteral',
    elements,
    tokens: sortBy(tokens, 'begin'),
    messages,
  }
}

export function buildArrayLiteralExpression(tokens: Token[]): ArrayLiteralExpression | undefined {
  if (tokenArrayMatches(tokens, TokenKind.OpenBracket)) {
    let extraTokens: Token[] = [tokens[0]];
    tokens = tokens.slice(1);

    let elements: Expression[] = [];
    let messages: Message[] = [];
    while (!tokenArrayMatches(tokens, TokenKind.CloseBracket)) {
      let nextElement = buildExpression(tokens);
      tokens = tokens.slice(nextElement.tokens.length);
      elements.push(nextElement);

      if (tokenArrayMatches(tokens, TokenKind.Comma)) {
        extraTokens.push(tokens[0]);
        tokens = tokens.slice(1);
      }
      else if (!tokenArrayMatches(tokens, TokenKind.CloseBracket)) {
        messages.push(makeMessage('Error', 'Missing comma in between array elements.'));
      }
    }

    if (tokenArrayMatches(tokens, TokenKind.CloseBracket)) {
      extraTokens.push(tokens[0]);
    }
    else {
      messages.push(makeMessage('Error', 'Missing closing bracket at end of array.'));
    }

    return makeArrayLiteralExpression(elements, extraTokens, messages);
  }
}
