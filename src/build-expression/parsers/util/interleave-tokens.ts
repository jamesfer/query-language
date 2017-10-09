import { Token } from '../../../token.model';
import { sum, map, sortBy } from 'lodash';

function arrayInsert<T>(array: T[], index: number, elements: T[]) {
  let i = -1;
  while (++i < elements.length) {
    array[index + i] = elements[i];
  }
}

// Attempt to combine tokens so that they require minimal resorting.
export function interleaveTokens(expressionTokens: Token[][], separators: Token[]): Token[] {
  const length = sum(map(expressionTokens, 'length')) + separators.length;
  let tokens: Token[] = Array(length);
  let i = -1;
  let tokenIndex = 0;
  while (++i < expressionTokens.length) {
    // Insert an extra token first as this is likely the opening of the list
    if (i < separators.length) {
      tokens[tokenIndex] = separators[i];
      tokenIndex += 1;
    }

    // Then follow it with the tokens of that element
    arrayInsert(tokens, tokenIndex, expressionTokens[i]);
    tokenIndex += expressionTokens[i].length;
  }

  // Insert any remaining extra tokens. Eg. the last ]
  arrayInsert(tokens, tokenIndex, separators.slice(i));

  return sortBy(tokens, 'begin');
}
