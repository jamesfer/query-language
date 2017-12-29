import { evaluates } from '../runner';
import {
  addToken,
  arrayExpression,
  closeBracketToken, closeParenToken,
  commaToken, functionCallExpression, identifierExpression,
  identifierToken, integerExpression, integerToken, openBracketToken,
  openParenToken,
} from '../utils';
import {
  BooleanType,
  FloatType,
  IntegerType, makeArrayType,
  makeFunctionType, makeUnionType,
} from '../../src/type';

describe('functions', function() {
  let headIdentifier = identifierExpression(
    makeFunctionType([ makeArrayType('T') ], 'T'),
    'head'
  );

  let addIdentifier = identifierExpression(
    makeFunctionType([ FloatType, FloatType ], FloatType),
    '+',
  );

  let ifIdentifier = identifierExpression(
    makeFunctionType([ BooleanType, 'T', 'F' ], makeUnionType(['T', 'F'])),
    'if',
  );

  evaluates('function calls', 'head([1, 2, 3])', {
    result: 1,
    tokens: [
      identifierToken('head'),
      openParenToken(),
      openBracketToken(),
      integerToken('1'),
      commaToken(),
      integerToken('2', 1),
      commaToken(),
      integerToken('3', 1),
      closeBracketToken(),
      closeParenToken(),
    ],
    expression: functionCallExpression(
      IntegerType,
      headIdentifier,
      [
        arrayExpression(IntegerType, [
          integerExpression(1),
          integerExpression(2),
          integerExpression(3),
        ])
      ]
    ),
  });

  evaluates('infix operators', '1 + 2', {
    result: 3,
    tokens: [
      integerToken('1'),
      addToken(1),
      integerToken('2', 1),
    ],
    expression: functionCallExpression(
      FloatType,
      addIdentifier,
      [
        integerExpression(1),
        integerExpression(2),
      ],
    )
  });

  evaluates('partial application', 'if(1)(2)(3)', {
    result: 2,
    tokens: [
      identifierToken('if'),
      openParenToken(),
      integerToken('1'),
      closeParenToken(),
      openParenToken(),
      integerToken('2'),
      closeParenToken(),
      openParenToken(),
      integerToken('3'),
      closeParenToken(),
    ],
    expression: functionCallExpression(
      IntegerType,
      functionCallExpression(
        makeFunctionType([ 'F' ], makeUnionType([ IntegerType, 'F' ])),
        functionCallExpression(
          makeFunctionType([ 'T', 'F' ], makeUnionType(['F', 'T'])),
          ifIdentifier,
          [ integerExpression(1) ]
        ),
        [ integerExpression(2) ]
      ),
      [ integerExpression(3) ],
    )
  });

  evaluates('partial application of infix functions', '(1 +)(2)', {
    result: 3,
    tokens: [
      openParenToken(),
      integerToken('1'),
      addToken(1),
      closeParenToken(),
      openParenToken(),
      integerToken('2'),
      closeParenToken(),
    ],
    expression: functionCallExpression(
      FloatType,
      functionCallExpression(
        makeFunctionType([ FloatType ], FloatType),
        addIdentifier,
        [ integerExpression(1) ]
      ),
      [ integerExpression(2) ]
    )
  });
});
