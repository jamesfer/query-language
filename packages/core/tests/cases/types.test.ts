import {
  addToken, functionCallExpression, identifierExpression, integerExpression, integerToken,
  stringExpression,
  stringToken,
} from '../utils';
import { evaluates } from '../runner';
import { floatType, makeFunctionType } from '../../src/type/constructors';
import { makeMessage } from '../../src/message';

let addIdentifier = identifierExpression(
  makeFunctionType([ floatType, floatType ], floatType),
  '+',
);

describe.only('type checking', () => {
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
