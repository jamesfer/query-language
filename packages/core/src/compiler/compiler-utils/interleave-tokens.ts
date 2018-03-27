import { map, sortBy, sum } from 'lodash';
import { Token } from '../../token';

function arrayInsert<T>(array: T[], index: number, elements: T[]) {
  for (let i = 0; i < elements.length; i += 1) {
    array[index + i] = elements[i];
  }
}

// Attempt to combine tokens so that they require minimal resorting.
export function interleaveTokens(expressionTokens: Token[][], separators: Token[]): Token[] {
  const length = sum(map(expressionTokens, 'length')) + separators.length;
  const tokens: Token[] = Array(length);
  let tokenIndex = 0;
  for (let i = 0; i < expressionTokens.length; i += 1) {
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
  arrayInsert(tokens, tokenIndex, separators.slice(expressionTokens.length));

  return sortBy(tokens, 'begin');
}
