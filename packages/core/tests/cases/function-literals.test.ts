import {
  floatType,
  integerType,
  makeArrayType,
  makeFunctionType, makeTypeVariable, noneType,
} from '../../src/type/constructors';
import { evaluates } from '../runner';
import {
  addToken,
  arrayExpression,
  closeBracketToken, closeParenToken,
  commaToken, fatArrowToken, functionCallExpression, identifierExpression,
  identifierToken, integerExpression,
  integerToken,
  openBracketToken,
  openParenToken,
} from '../utils';

describe('function literals', () => {
  evaluates('simple mapping', 'map(a => a + 1, [1, 2, 3])', {
    result: [2, 3, 4],
    tokens: [
      identifierToken('map'),
      openParenToken(),
      identifierToken('a'),
      fatArrowToken(1),
      identifierToken('a', 1),
      addToken(1),
      integerToken('1', 1),
      commaToken(),
      openBracketToken(1),
      integerToken('1'),
      commaToken(),
      integerToken('2', 1),
      commaToken(),
      integerToken('3', 1),
      closeBracketToken(),
      closeParenToken(),
    ],
    expression: functionCallExpression(
      makeArrayType(integerType),
      identifierExpression(
        makeFunctionType([makeFunctionType(['T'], 'R'), makeArrayType('T')], makeArrayType('T')),
        'map',
      ),
      [
        {
          kind: 'Function',
          resultType: makeFunctionType([floatType], floatType),
          functionExpression: functionCallExpression(
            floatType,
            identifierExpression(
              makeFunctionType([floatType, floatType], floatType),
              '+',
            ),
            [
              identifierExpression(makeTypeVariable('aT'), 'a'),
              integerExpression(1),
            ],
          ),
          args: ['a'],
        },
        arrayExpression(integerType, [
          integerExpression(1),
          integerExpression(2),
          integerExpression(3),
        ]),
      ],
    ),
  });
});
