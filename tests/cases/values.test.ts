import { evaluates } from '../runner';
import {
  arrayExpression, booleanExpression, booleanToken,
  closeBracketToken,
  commaToken,
  floatExpression, floatToken, integerExpression, integerToken,
  openBracketToken,
  stringExpression,
  stringToken,
} from '../utils';
import { integerType } from '../../src/type/constructors';
import { makeMessage } from '../../src/message';

describe('values', function() {
  evaluates('integers', '123', {
    result: 123,
    tokens: [
      integerToken('123'),
    ],
    expression: integerExpression(123),
  });

  evaluates('integers in scientific form', '123e10', {
    result: 123e10,
    tokens: [
      floatToken('123e10'),
    ],
    expression: floatExpression(123e10),
  });

  evaluates('floats', '123.123', {
    result: 123.123,
    tokens: [
      floatToken('123.123'),
    ],
    expression: floatExpression(123.123),
  });

  evaluates('floats in scientific form', '123.123e2', {
    result: 123.123e2,
    tokens: [
      floatToken('123.123e2'),
    ],
    expression: floatExpression(123.123e2),
  });

  evaluates('double quoted strings', '"Hello world"', {
    result: 'Hello world',
    tokens: [
      stringToken('"Hello world"'),
    ],
    expression: stringExpression('Hello world'),
  });

  evaluates('single quoted strings containing a double quote', "'Hello \" world'", {
    result: 'Hello " world',
    tokens: [
      stringToken("'Hello \" world'"),
    ],
    expression: stringExpression('Hello " world'),
  });

  evaluates('single quoted strings containing escaped single quotes', "'Hello \\' world'", {
    result: "Hello \\' world",
    tokens: [
      stringToken("'Hello \\' world'"),
    ],
    expression: stringExpression("Hello \\' world"),
  });

  evaluates('single quoted strings', "'Hello world'", {
    result: 'Hello world',
    tokens: [
      stringToken("'Hello world'"),
    ],
    expression: stringExpression('Hello world'),
  });

  evaluates('double quoted strings containing a single quote', '"Hello \' world"', {
    result: "Hello ' world",
    tokens: [
      stringToken('"Hello \' world"'),
    ],
    expression: stringExpression("Hello ' world"),
  });

  evaluates('double quoted strings containing escaped double quotes', '"Hello \\" world"', {
    result: 'Hello \\" world',
    tokens: [
      stringToken('"Hello \\" world"'),
    ],
    expression: stringExpression('Hello \\" world'),
  });

  evaluates('array literals', '[1, 2, 3]', {
    result: [1, 2, 3],
    tokens: [
      openBracketToken(),
      integerToken('1'),
      commaToken(),
      integerToken('2', 1),
      commaToken(),
      integerToken('3', 1),
      closeBracketToken(),
    ],
    expression: arrayExpression(integerType, [
      integerExpression(1),
      integerExpression(2),
      integerExpression(3),
    ]),
  });

  evaluates('array literals with trailing commas', '[1, 2, 3,]', {
    result: [1, 2, 3],
    tokens: [
      openBracketToken(),
      integerToken('1'),
      commaToken(),
      integerToken('2', 1),
      commaToken(),
      integerToken('3', 1),
      commaToken(),
      closeBracketToken(),
    ],
    expression: arrayExpression(integerType, [
      integerExpression(1),
      integerExpression(2),
      integerExpression(3),
    ]),
  });

  evaluates('array literals with missing commas', '[1, 2 3]', {
    compiled: false,
    evaluated: false,
    tokens: [
      openBracketToken(),
      integerToken('1'),
      commaToken(),
      integerToken('2', 1),
      integerToken('3', 1),
      closeBracketToken(),
    ],
    expression: arrayExpression(integerType, [
      integerExpression(1),
      integerExpression(2),
      integerExpression(3),
    ]),
    messages: [
      makeMessage(
        'Error',
        'Missing separator between items',
        [ 0, 5 ],
        [ 0, 6 ],
      ),
    ],
  });

  evaluates('boolean true literals', 'true', {
    result: true,
    tokens: [
      booleanToken('true'),
    ],
    expression: booleanExpression(true),
  });

  evaluates('boolean false literals', 'false', {
    result: false,
    tokens: [
      booleanToken('false'),
    ],
    expression: booleanExpression(false),
  });
});
