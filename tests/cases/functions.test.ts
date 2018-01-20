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
  makeUnionType,
} from '../../src/type/constructors';
import {
  booleanType, floatType,
  integerType, makeArrayType, makeFunctionType,
} from '../../src/type/constructors';

describe('functions', function() {
  let headIdentifier = identifierExpression(
    makeFunctionType([ makeArrayType('T') ], 'T'),
    'head'
  );

  let addIdentifier = identifierExpression(
    makeFunctionType([ floatType, floatType ], floatType),
    '+',
  );

  let ifIdentifier = identifierExpression(
    makeFunctionType([ booleanType, 'T', 'F' ], makeUnionType(['T', 'F'])),
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
      integerType,
      headIdentifier,
      [
        arrayExpression(integerType, [
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
      floatType,
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
      integerType,
      functionCallExpression(
        makeFunctionType([ 'F' ], makeUnionType([ integerType, 'F' ])),
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
      floatType,
      functionCallExpression(
        makeFunctionType([ floatType ], floatType),
        addIdentifier,
        [ integerExpression(1) ]
      ),
      [ integerExpression(2) ]
    )
  });
});
