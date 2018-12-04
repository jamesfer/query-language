import {
  addToken, booleanExpression, booleanToken, closeParenToken, commaToken, floatExpression,
  floatToken,
  functionCallExpression,
  identifierExpression,
  identifierToken,
  integerExpression,
  integerToken, openParenToken,
  stringExpression,
  stringToken,
} from '../utils';
import { evaluates } from '../runner';
import {
  booleanType, floatType, makeFunctionType, stringType,
} from '../../src/type/constructors';
import { makeMessage } from '../../src/message';

let addIdentifier = identifierExpression(
  makeFunctionType([ floatType, floatType ], floatType),
  '+',
);

describe('type checking', () => {
  evaluates('calculates partial function type', '1.5 +', {
    compiled: true,
    evaluated: true,
    tokens: [
      floatToken('1.5'),
      addToken(1),
    ],
    expression: functionCallExpression(
      makeFunctionType([ floatType ], floatType),
      addIdentifier,
      [ floatExpression(1.5) ],
    ),
  });

  evaluates('calculates polymorphic partial function types', 'if(true, "Is true")', {
    compiled: true,
    evaluated: true,
    tokens: [
      identifierToken('if'),
      openParenToken(),
      booleanToken('true'),
      commaToken(),
      stringToken('"Is true"', 1),
      closeParenToken(),
    ],
    expression: functionCallExpression(
      makeFunctionType([ stringType ], stringType),
      identifierExpression(makeFunctionType([ booleanType, 'T', 'T' ], 'T'), 'if'),
      [
        booleanExpression(true),
        stringExpression("Is true"),
      ]
    )
  });

  describe('emit type error', () => {

  evaluates('emits type error', '1 + "1"', {
    compiled: false,
    evaluated: false,
    tokens: [
      integerToken('1'),
      addToken(1),
      stringToken('"1"', 1),
    ],
    expression: functionCallExpression(
      floatType,
      addIdentifier,
      [integerExpression(1), stringExpression('1')]
    ),
    messages: [
      makeMessage('Error', 'Argument has an incorrect type.', [0, 4], [0, 7]),
    ],
  });
  });
});
