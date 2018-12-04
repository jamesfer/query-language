import { makeUntypedUnrecognizedExpression, UntypedExpression } from '../untyped-expression';
import { Token } from '../token';
import { firstResult } from '../utils';
import { interpretFunction } from './expression-compilers/function';
import {
  interpretFunctionCall,
} from './expression-compilers/function-call/interpret-function-call';
import { interpretIdentifier } from './expression-compilers/identifier';
import { interpretOperatorExpression } from './expression-compilers/operators/operator';
import { interpretParenthesis } from './expression-compilers/parenthesis';
import { interpretString } from './expression-compilers/string';
import { interpretNumber } from './expression-compilers/number';
import { interpretArray } from './expression-compilers/array';
import { interpretBoolean } from './expression-compilers/boolean';

export type ExpressionInterpreter = (
  tokens: Token[],
  previous: UntypedExpression | null,
  precedence: number,
) => UntypedExpression | undefined;

const interpretLiteral: ExpressionInterpreter = (tokens, previous, precedence) => {
  if (previous === null) {
    return firstResult(
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
  return undefined;
};

const runInterpreters: ExpressionInterpreter = (tokens, previous, precedence) => {
  if (tokens.length) {
    return firstResult(
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
  return undefined;
};

export function interpretExpression(
  tokens: Token[],
  previous: UntypedExpression | null = null,
  precedence: number = 0,
): UntypedExpression | undefined {
  let result: UntypedExpression | undefined;
  let expressionPart = runInterpreters(tokens, previous, precedence);
  while (expressionPart) {
    const unusedTokens = tokens.slice(expressionPart.tokens.length);
    result = expressionPart;
    expressionPart = runInterpreters(unusedTokens, expressionPart, precedence);
  }
  return result;
}

export function interpretSyntaxTree(tokens: Token[]): UntypedExpression[] {
  const expressions: UntypedExpression[] = [];
  let remainingTokens = tokens;
  while (remainingTokens.length) {
    const result = interpretExpression(remainingTokens, null, 0)
      || makeUntypedUnrecognizedExpression(remainingTokens);
    expressions.push(result);

    remainingTokens = remainingTokens.slice(result.tokens.length);
  }
  return expressions;
}
