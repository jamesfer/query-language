import { Token } from '../token';
import { makeUntypedUnrecognizedExpression, UntypedExpression } from '../untyped-expression';
import { Log, LogValue } from './compiler-utils/monoids/log';
import { interpretArray } from './expression-compilers/array';
import { interpretBoolean } from './expression-compilers/boolean';
import { interpretFunction } from './expression-compilers/function';
import { interpretFunctionCall } from './expression-compilers/function-call/interpret-function-call';
import { interpretIdentifier } from './expression-compilers/identifier';
import { interpretNumber } from './expression-compilers/number';
import { interpretOperatorExpression } from './expression-compilers/operators/operator';
import { interpretParenthesis } from './expression-compilers/parenthesis';
import { interpretString } from './expression-compilers/string';

export type ExpressionInterpreter = (
  tokens: Token[],
  previous: UntypedExpression | null,
  precedence: number,
) => LogValue<UntypedExpression | undefined>;

export function coalesceLogs<R>(functions: (() => LogValue<R | undefined>)[]): LogValue<R | undefined>;
export function coalesceLogs<R, P1>(functions: ((p1: P1) => LogValue<R | undefined>)[], p1: P1): LogValue<R | undefined>;
export function coalesceLogs<R, P1, P2>(functions: ((p1: P1, p2: P2) => LogValue<R | undefined>)[], p1: P1, p2: P2): LogValue<R | undefined>;
export function coalesceLogs<R, P1, P2, P3>(functions: ((p1: P1, p2: P2, p3: P3) => LogValue<R | undefined>)[], p1: P1, p2: P2, p3: P3): LogValue<R | undefined>;
export function coalesceLogs<R, P1, P2, P3, P4>(functions: ((p1: P1, p2: P2, p3: P3, p4: P4) => LogValue<R | undefined>)[], p1: P1, p2: P2, p3: P3, p4: P4): LogValue<R | undefined>;
export function coalesceLogs<R>(functions: ((...args: any[]) => LogValue<R | undefined>)[], ...args: any[]): LogValue<R | undefined> {
  const log = Log.empty();
  for (const func of functions) {
    const result = log.combine(func(...args));
    if (result !== undefined) {
      return log.wrap(result);
    }
  }
  return log.wrap(undefined);
}


const interpretLiteral: ExpressionInterpreter = (tokens, previous, precedence) => {
  if (previous === null) {
    return coalesceLogs(
      [
        interpretParenthesis,
        interpretString,
        interpretNumber,
        interpretArray,
        interpretBoolean,
        interpretFunction,
        interpretIdentifier,
      ],
      tokens,
      previous,
      precedence,
    );
  }
  return Log.of(undefined);
};

const runInterpreters: ExpressionInterpreter = (tokens, previous, precedence) => {
  if (tokens.length) {
    return coalesceLogs(
      [
        interpretLiteral,
        interpretFunctionCall,
        interpretOperatorExpression,
      ],
      tokens,
      previous,
      precedence,
    );
  }
  return Log.of(undefined);
};

export function interpretExpression(
  tokens: Token[],
  previous: UntypedExpression | null = null,
  precedence: number = 0,
): LogValue<UntypedExpression | undefined> {
  const log = Log.empty();
  let result: UntypedExpression | undefined;
  let expressionPart = log.combine(runInterpreters(tokens, previous, precedence));
  while (expressionPart) {
    const unusedTokens = tokens.slice(expressionPart.tokens.length);
    result = expressionPart;
    expressionPart = log.combine(runInterpreters(unusedTokens, expressionPart, precedence));
  }
  return log.wrap(result);
}

export function interpretSyntaxTree(tokens: Token[]): LogValue<UntypedExpression[]> {
  const log = Log.empty();
  const expressions: UntypedExpression[] = [];
  let remainingTokens = tokens;
  while (remainingTokens.length) {
    const logResult = interpretExpression(remainingTokens, null, 0);
    const result = log.combine(logResult) || makeUntypedUnrecognizedExpression(remainingTokens);
    expressions.push(result);
    remainingTokens = remainingTokens.slice(result.tokens.length);
  }
  return log.wrap(expressions);
}
