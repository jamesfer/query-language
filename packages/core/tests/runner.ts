import { AssertionError, expect } from 'chai';
import {
  assign,
  each,
  isArray,
  isFunction,
  isPlainObject,
  join,
  map,
  omit,
  split,
} from 'lodash';
import { Observable } from 'rxjs/Observable';
import { inspect } from 'util';
import { execute, ExecutionResult } from '../src/api';
import {
  ArrayExpression,
  Expression,
  FunctionCallExpression,
  FunctionExpression,
} from '../src/expression';
import { Message } from '../src/message';
import { Token } from '../src/token';
import { Type } from '../src/type/type';
import { assertNever } from '../src/utils';
import { addPositions } from '../src/position';
import { FunctionValue } from '../src/value';


export interface ValueExpressionExpectation {
  kind: 'String' | 'Integer' | 'Float' | 'Identifier' | 'Boolean',
  resultType: Type | null,
  value: any,
}

export interface FunctionCallExpressionExpectation {
  kind: 'FunctionCall',
  resultType: Type | null,
  functionExpression: ExpressionExpectation,
  args: (ExpressionExpectation | null)[],
}

export interface FunctionExpressionExpectation {
  kind: 'Function',
  resultType: Type | null,
  functionExpression: ExpressionExpectation,
  args: string[],
}

export interface ArrayExpressionExpectation {
  kind: 'Array',
  resultType: Type | null,
  elements: ExpressionExpectation[],
}

export type ExpressionExpectation = ValueExpressionExpectation
  | FunctionCallExpressionExpectation
  | FunctionExpressionExpectation
  | ArrayExpressionExpectation;


export interface BaseEvaluationExpectation {
  result?: any,
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



function isFunctionValue(value: FunctionValue | Expression): value is FunctionValue {
  return value.kind === 'Function' && isFunction(value.value);
}

function compareTypes(actual: Type | null, expected: Type | null) {
  if (actual === null || expected === null) {
    expect(actual).to.equal(expected);
    return;
  }

  switch (actual.kind) {
    case 'Integer':
    case 'Float':
    case 'Boolean':
    case 'String':
    case 'None':
    case 'Interface':
    case 'Record':
      expect(actual).to.deep.equal(expected);
      return;

    case 'Array':
      expect(expected.kind).to.equal('Array');
      if (expected.kind === 'Array') {
        compareTypes(actual.elementType, expected.elementType);
      }
      return;

    case 'Variable':
      expect(expected.kind).to.equal('Variable');
      if (expected.kind === 'Variable') {
        expect(expected.name).to.equal(actual.name);
      }
      return;

    case 'Function':
      expect(expected.kind).to.equal('Function');
      if (expected.kind === 'Function') {
        compareTypes(actual.returnType, expected.returnType);
        expected.argTypes.forEach((arg, index) => compareTypes(arg, actual.argTypes[index]));
      }
      return;

    default:
      return assertNever(actual);
  }
}

function compareExpressions(actual: Expression | null | undefined, expected: ExpressionExpectation | null | undefined) {
  if (!actual  || !expected) {
    expect(actual).to.equal(expected);
    return;
  }

  expect(actual.kind).to.equal(expected.kind);
  // expect(actual.resultType).to.deep.equal(expected.resultType);
  compareTypes(actual.resultType, expected.resultType);

  switch (expected.kind) {
    case 'Array': {
      let actualArray = actual as ArrayExpression;

      // Compare elements
      expect(actualArray.elements.length).to.equal(expected.elements.length);
      each(actualArray.elements, (expression, index) => {
        compareExpressions(expression, expected.elements[index]);
      });
      break;
    }

    case 'Function': {
      let actualFunction = actual as FunctionExpression;
      if (!isFunctionValue(actualFunction.value)) {
        compareExpressions(
          actualFunction.value,
          expected.functionExpression,
        );
      }

      expect(actualFunction.argumentNames).to.deep.equal(expected.args);
      break;
    }


    case 'FunctionCall': {
      let actualFunction = actual as FunctionCallExpression;

      // Compare function expression
      compareExpressions(
        actualFunction.functionExpression,
        expected.functionExpression,
      );

      // Compare arguments
      expect(actualFunction.args.length).to.equal(expected.args.length);
      each(actualFunction.args, (arg, index) => {
        compareExpressions(arg, expected.args[index]);
      });
      break;
    }

    case 'String':
    case 'Identifier':
    case 'Integer':
    case 'Boolean':
    case 'Float': {
      const ignoreKeys = ['expression', 'messages', 'tokens', 'resultType'];
      expect(omit(actual, ignoreKeys)).to.deep.equal(omit(expected, ignoreKeys));
      break;
    }

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
  if (program.result && expected.result) {
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


export function stringifyProgram(program: ExecutionResult): string {
  program = { ...program };
  if (program.result instanceof Observable) {
    (program.result as any)[inspect.custom] = () => 'Observable';
  }
  return inspect(program, { depth: null, maxArrayLength: null });
}


export function indent(str: string, indent: number): string {
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


function evaluateCode(code: string, minimalExpected: MinimalEvaluationExpectation) {
  let expected: EvaluationExpectation = assign({
    messages: [],
    compiled: true,
    evaluated: true,
  }, minimalExpected);

  // Correct relative token offsets
  for (let i = 0; i < expected.tokens.length; i++) {
    if (i !== 0) {
      const token = expected.tokens[i];
      const offset = expected.tokens[i - 1].end;
      token.begin = addPositions(offset, token.begin);
      token.end = addPositions(offset, token.end);
    }
  }

  let program = execute(code);
  return validateProgram(program, expected);
}


function evaluatesFunc(test: string, code: string, minimalExpected: MinimalEvaluationExpectation) {
  it(test, function() {
    return evaluateCode(code, minimalExpected);
  });
}


function skipEvaluates(test: string, code: string, minimalExpected: MinimalEvaluationExpectation) {
  it.skip(test, function() {
    return evaluateCode(code, minimalExpected);
  });
}


function onlyEvaluates(test: string, code: string, minimalExpected: MinimalEvaluationExpectation) {
  it.only(test, function() {
    return evaluateCode(code, minimalExpected);
  });
}


export const evaluates = assign(evaluatesFunc, {
  skip: skipEvaluates,
  only: onlyEvaluates,
});
