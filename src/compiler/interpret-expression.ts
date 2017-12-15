import { UntypedExpression } from '../untyped-expression.model';
import { Token } from '../token.model';
import { firstResult } from '../utils';
import { buildFunctionCallExpression } from './expression-compilers/function/interpret-function-call';
import { buildIdentifierExpression } from './expression-compilers/identifier';
import { buildOperatorExpression } from './expression-compilers/operators/operator';
import { buildParenthesisExpression } from './expression-compilers/parenthesis';
import { makeUntypedUnrecognizedExpression } from '../untyped-expression.model';
import { buildStringExpression } from './expression-compilers/string';
import { buildNumericExpression } from './expression-compilers/numeric';
import { buildArrayExpression } from './expression-compilers/array';
import { buildBooleanExpression } from './expression-compilers/boolean';

function buildLiteralExpression(tokens: Token[], prevExpression: UntypedExpression | null, operatorPrecedence: number): UntypedExpression | undefined {
  if (prevExpression === null) {
    return firstResult([
      buildStringExpression,
      buildNumericExpression,
      buildArrayExpression,
      buildBooleanExpression,
    ], tokens)
  }
}

function runExpressionBuilders(tokens: Token[], prevExpression: UntypedExpression | null = null, operatorPrecedence: number = 0): UntypedExpression | undefined {
  if (tokens.length) {
    return firstResult([
      buildParenthesisExpression,
      buildLiteralExpression,
      buildIdentifierExpression,
      buildFunctionCallExpression,
      buildOperatorExpression,
    ], tokens, prevExpression, operatorPrecedence);
  }
}

export function buildExpression(tokens: Token[], prevExpression: UntypedExpression | null = null, operatorPrecedence: number = 0): UntypedExpression | null {
  let result: UntypedExpression | undefined;
  let expressionPart = runExpressionBuilders(tokens, prevExpression, operatorPrecedence);
  while (expressionPart) {
    let unusedTokens = tokens.slice(expressionPart.tokens.length);
    result = expressionPart;
    expressionPart = runExpressionBuilders(unusedTokens, expressionPart, operatorPrecedence);
  }
  return result || null;
}

export function buildSyntaxTree(tokens: Token[]): UntypedExpression[] {
  let expressions: UntypedExpression[] = [];
  let remainingTokens = tokens;
  while (remainingTokens.length) {
    let result = buildExpression(remainingTokens)
      || makeUntypedUnrecognizedExpression(remainingTokens);
    remainingTokens = remainingTokens.slice(result.tokens.length);
    expressions.push(result);
  }
  return expressions;
}
