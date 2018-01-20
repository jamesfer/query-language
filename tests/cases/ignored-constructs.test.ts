import { evaluates } from '../runner';
import {
  arrayExpression,
  closeBracketToken, commaToken, commentToken, integerExpression, integerToken,
  openBracketToken,
} from '../utils';
import { integerType } from '../../src/type/constructors';

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
    expression: arrayExpression(integerType, [
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
    expression: arrayExpression(integerType, [
      integerExpression(1),
      integerExpression(2),
    ]),
  });

  evaluates('supports comments', '-- This is a comment\n1', {
    result: 1,
    tokens: [
      integerToken('1', [ 1, 0 ]),
    ],
    expression: integerExpression(1),
  });

  evaluates('supports comments in the middle of expressions',
    '[1 \n--This is a comment\n ,2, -- This is a comment\n 3]', {
    result: [ 1, 2, 3 ],
    tokens: [
      openBracketToken(),
      integerToken('1'),
      commaToken([ 2, 1 ]),
      integerToken('2'),
      commaToken(),
      integerToken('3', [ 1, 1 ]),
      closeBracketToken(),
    ],
    expression: arrayExpression(integerType, [
      integerExpression(1),
      integerExpression(2),
      integerExpression(3),
    ]),
  });
});
