import { evaluates } from '../runner';
import {
  arrayExpression,
  closeBracketToken, commaToken, integerExpression, numericToken,
  openBracketToken,
} from '../utils';
import { IntegerType } from '../../src/type.model';

describe('whitespace', function() {
  evaluates('ignores spaces and tabs', '[      1 \t \t,2    ]', {
    result: [ 1, 2 ],
    tokens: [
      openBracketToken(),
      numericToken('1', 6),
      commaToken(4),
      numericToken('2'),
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
      numericToken('1', [ 1, 2 ]),
      commaToken(),
      numericToken('2', [ 1, 2 ]),
      closeBracketToken([ 1, 0 ]),
    ],
    expression: arrayExpression(IntegerType, [
      integerExpression(1),
      integerExpression(2),
    ]),
  });
});
