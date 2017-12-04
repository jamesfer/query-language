import { Token } from '../src/token.model';
import { Message } from '../src/message.model';
import { Expression } from '../src/expression.model';
import { TypedFunctionCallExpression } from '../src/compile/type/typers/function-call';
import { TypedIdentifierExpression } from '../src/compile/type/typers/identifier';
import { TypedStringLiteralExpression } from '../src/compile/type/typers/string-literal';
import {
  TypedFloatLiteralExpression,
  TypedIntegerLiteralExpression,
} from '../src/compile/type/typers/numeric-literal';
import {
  TypedExpression,
  TypedNoneLiteralExpression,
  TypedUnrecognizedExpression,
} from '../src/typed-expression.model';
import { TypedArrayLiteralExpression } from '../src/compile/type/typers/array-literal';
import { assign, isFunction, isPlainObject, isArray, each, omit, join, split, map } from 'lodash';
import { execute, ExecutionResult } from '../src/api';
import { expect, AssertionError } from 'chai';
import { Observable } from 'rxjs/Observable';
import { Type } from '../src/type.model';
import { assertNever } from '../src/utils';
import { inspect } from 'util';
import { StringLiteralExpression } from '../src/compile/interpret/interpreters/literal/string-literal';
import { IdentifierExpression } from '../src/compile/interpret/interpreters/identifier';


export interface ValueExpressionExpectation {
  kind: 'StringLiteral' | 'IntegerLiteral' | 'FloatLiteral' | 'Identifier',
  resultType: Type | null,
  value: any,
}

export interface FunctionExpressionExpectation {
  kind: 'FunctionCall',
  resultType: Type | null,
  functionExpression: ExpressionExpectation,
  args: (ExpressionExpectation | null)[],
}

export interface ArrayExpressionExpectation {
  kind: 'ArrayLiteral',
  resultType: Type | null,
  elements: ExpressionExpectation[],
}

export type ExpressionExpectation = ValueExpressionExpectation
  | FunctionExpressionExpectation
  | ArrayExpressionExpectation;


export interface BaseEvaluationExpectation {
  result: any,
  tokens: Token[],
  expression: ExpressionExpectation,
}

export interface EvaluationExpectationOptionals extends BaseEvaluationExpectation {
  messages: Message[],
  compiled: boolean,
  evaluated: boolean,
}

export type EvaluationExpectation
  = BaseEvaluationExpectation & EvaluationExpectationOptionals;
export type MinimalEvaluationExpectation
  = BaseEvaluationExpectation & Partial<EvaluationExpectationOptionals>;



function compareExpressions(actual: TypedExpression | null | undefined, expected: ExpressionExpectation | null | undefined) {
  if (!actual  || !expected) {
    expect(actual).to.equal(expected);
    return;
  }

  expect(actual.kind).to.equal(expected.kind);
  expect(actual.resultType).to.deep.equal(expected.resultType);

  switch (expected.kind) {
    case 'ArrayLiteral':
      let actualArray = actual as TypedArrayLiteralExpression;

      // Compare elements
      expect(actualArray.elements.length).to.equal(expected.elements.length);
      each(actualArray.elements, (expression, index) => {
        compareExpressions(expression, expected.elements[index]);
      });
      break;

    case 'FunctionCall':
      let actualFunction = actual as TypedFunctionCallExpression;

      // Compare function expression
      compareExpressions(
        actualFunction.functionExpression,
        expected.functionExpression
      );

      // Compare arguments
      expect(actualFunction.args.length).to.equal(expected.args.length);
      each(actualFunction.args, (arg, index) => {
        compareExpressions(arg, expected.args[index]);
      });
      break;

    case 'StringLiteral':
      const stringExpression = {
        resultType: actual.resultType,
        kind: actual.kind,
        value: (actual.expression as StringLiteralExpression).contents,
      };
      expect(stringExpression).to.deep.equal(expected);
      break;

    case 'Identifier':
      const identifierExpression = {
        resultType: actual.resultType,
        kind: actual.kind,
        value: (actual.expression as IdentifierExpression).name,
      };
      expect(identifierExpression).to.deep.equal(expected);
      break;

    case 'IntegerLiteral':
    case 'FloatLiteral':
      expect(omit(actual, ['expression', 'messages'])).to.deep.equal(expected);
      break;

    default:
      return assertNever(expected);
  }
}


function assertProgramContents(program: ExecutionResult, expected: EvaluationExpectation) {
  // Assert the program compiled
  expect(program.compiled).to.equal(expected.compiled);
  expect(program.evaluated).to.equal(expected.evaluated);
  if (expected.compiled && expected.evaluated) {
    expect(program.result).to.be.an.instanceof(Observable);
  }

  // Assert the messages are correct
  expect(program.messages).to.have.deep.members(expected.messages);
  let message = `Program produced ${program.messages.length} messages when ${expected.messages.length} were expected`;
  expect(program.messages.length).to.equal(expected.messages.length, message);

  // Assert the tokens are correct
  expect(program.tokens).to.deep.equal(expected.tokens);

  // Assert the expressions are correct
  compareExpressions(program.expression, expected.expression);

  // Assert the program result
  if (program.result) {
    return program.result.map(value => {
      if (isFunction(expected.result)) {
        expected.result(value);
      }
      else if (isPlainObject(expected.result) || isArray(expected.result)) {
        expect(value).to.deep.equal(expected.result);
      }
      else {
        expect(value).to.equal(expected.result);
      }
      return value;
    })
      .first()
      .toPromise();
  }
}


function stringifyProgram(program: ExecutionResult): string {
  program = { ...program };
  if (program.result instanceof Observable) {
    (program.result as any)[inspect.custom] = () => 'Observable';
  }
  return inspect(program);
}


function indent(str: string, indent: number): string {
  return join(map(split(str, '\n'), line => ' '.repeat(indent) + line), '\n');
}


function validateProgram(program: ExecutionResult, expected: EvaluationExpectation) {
  try {
    return assertProgramContents(program, expected);
  }
  catch (error) {
    if (error instanceof AssertionError) {
      const programString = stringifyProgram(program);
      const message = `\n\nCompilation Result:\n${programString}\n`;
      error.message += indent(message, 6);
    }
    throw error;
  }
}


export function evaluates(test: string, code: string, minimalExpected: MinimalEvaluationExpectation) {
  it(test, function() {
    let expected: EvaluationExpectation = assign({
      messages: [],
      compiled: true,
      evaluated: true,
    }, minimalExpected);

    // Correct relative token offsets
    for (let i = 0; i < expected.tokens.length; i++) {
      if (i !== 0) {
        const offset = expected.tokens[i - 1].end;
        expected.tokens[i].begin += offset;
        expected.tokens[i].end += offset
      }
    }

    let program = execute(code);
    return validateProgram(program, expected);
  });
}