import { evaluates } from '../runner';
import {
  arrayExpression,
  closeBracketToken,
  commaToken,
  floatExpression, integerExpression, numericToken, openBracketToken,
  stringExpression,
  stringToken,
} from '../utils';
import { IntegerType } from '../../src/type.model';
import { makeMessage } from '../../src/message.model';

describe('values', function() {
  evaluates('integers', '123', {
    result: 123,
    tokens: [
      numericToken('123'),
    ],
    expression: integerExpression(123),
  });

  evaluates('integers in scientific form', '123.123e10', {
    result: 123.123e10,
    tokens: [
      numericToken('123.123e10'),
    ],
    expression: integerExpression(123.123e10),
  });

  evaluates('floats', '123.123', {
    result: 123.123,
    tokens: [
      numericToken('123.123'),
    ],
    expression: floatExpression(123.123),
  });

  evaluates('floats in scientific form', '123.123e2', {
    result: 123.123e2,
    tokens: [
      numericToken('123.123e2'),
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
      numericToken('1'),
      commaToken(),
      numericToken('2', 1),
      commaToken(),
      numericToken('3', 1),
      closeBracketToken(),
    ],
    expression: arrayExpression(IntegerType, [
      integerExpression(1),
      integerExpression(2),
      integerExpression(3),
    ]),
  });

  evaluates('array literals with trailing commas', '[1, 2, 3,]', {
    result: [1, 2, 3],
    tokens: [
      openBracketToken(),
      numericToken('1'),
      commaToken(),
      numericToken('2', 1),
      commaToken(),
      numericToken('3', 1),
      commaToken(),
      closeBracketToken(),
    ],
    expression: arrayExpression(IntegerType, [
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
      numericToken('1'),
      commaToken(),
      numericToken('2', 1),
      numericToken('3', 1),
      closeBracketToken(),
    ],
    expression: arrayExpression(IntegerType, [
      integerExpression(1),
      integerExpression(2),
      integerExpression(3),
    ]),
    messages: [
      makeMessage('Error', 'Missing separator between items'),
    ],
  })
});
