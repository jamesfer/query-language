import { evaluates } from '../runner';
import {
  arrayExpression,
  closeBracketToken, commaToken, commentToken, integerExpression, integerToken,
  openBracketToken,
} from '../utils';
import { IntegerType } from '../../src/type.model';

describe('ignored constructs', function() {
  evaluates('ignores spaces and tabs', '[      1 \t \t,2    ]', {
    result: [ 1, 2 ],
    tokens: [
      openBracketToken(),
      integerToken('1', 6),
      commaToken(4),
      integerToken('2'),
      closeBracketToken(4),
    ],
    expression: arrayExpression(IntegerType, [
      integerExpression(1),
      integerExpression(2),
    ]),
  });

  evaluates('calculates correct line numbers', '[\n  1,\n  2\n]', {
    result: [ 1, 2 ],
    tokens: [
      openBracketToken(),
      integerToken('1', [ 1, 2 ]),
      commaToken(),
      integerToken('2', [ 1, 2 ]),
      closeBracketToken([ 1, 0 ]),
    ],
    expression: arrayExpression(IntegerType, [
      integerExpression(1),
      integerExpression(2),
    ]),
  });

  evaluates('supports comments', '-- This is a comment\n1', {
    result: 1,
    tokens: [
      commentToken('-- This is a comment'),
      integerToken('1', [ 1, 0 ]),
    ],
    expression: integerExpression(1),
  });
});
