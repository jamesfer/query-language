import { Token } from '../token';
import { makeUntypedUnrecognizedExpression, UntypedExpression } from '../untyped-expression';
import { coalesceLogs } from './coalesce-logs';
import { Log, LogValue } from './compiler-utils/monoids/log';
import { interpretArray } from './interpreters/array';
import { interpretBinding } from './interpreters/binding';
import { interpretBoolean } from './interpreters/boolean';
import { interpretFunction } from './interpreters/function';
import { interpretFunctionCall } from './interpreters/function-call';
import { interpretIdentifier } from './interpreters/identifier';
import { interpretImplementation } from './interpreters/implementation';
import { interpretInterface } from './interpreters/interface';
import { interpretNumber } from './interpreters/number';
import { interpretOperatorExpression } from './interpreters/operators/operator';
import { interpretParenthesis } from './interpreters/parenthesis';
import { interpretString } from './interpreters/string';

export type InterpretExpression = (
  tokens: Token[],
  previous?: UntypedExpression | null,
  precedence?: number,
) => LogValue<UntypedExpression | undefined>;

export type ExpressionInterpreter<T = UntypedExpression> = (
  tokens: Token[],
  previous: UntypedExpression | null,
  precedence: number,
) => LogValue<T | undefined>;


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
        interpretBinding,
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
        interpretInterface,
        interpretImplementation,
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
