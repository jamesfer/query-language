import { UntypedExpression } from '../untyped-expression';
import { Token, TokenKind } from '../token';
import { dropWhile, includes } from 'lodash';
import { firstResult } from '../utils';
import { interpretFunctionCall } from './expression-compilers/function/interpret-function-call';
import { interpretIdentifier } from './expression-compilers/identifier';
import { buildOperatorExpression } from './expression-compilers/operators/operator';
import { interpretParenthesis } from './expression-compilers/parenthesis';
import { makeUntypedUnrecognizedExpression } from '../untyped-expression';
import { intepretString } from './expression-compilers/string';
import { interpretNumber } from './expression-compilers/number';
import { interpretArray } from './expression-compilers/array';
import { interpretBoolean } from './expression-compilers/boolean';


function buildLiteralExpression(tokens: Token[], prevExpression: UntypedExpression | null, operatorPrecedence: number): UntypedExpression | undefined {
  if (prevExpression === null) {
    return firstResult([
      intepretString,
      interpretNumber,
      interpretArray,
      interpretBoolean,
    ], tokens)
  }
}

function runExpressionBuilders(tokens: Token[], prevExpression: UntypedExpression | null = null, operatorPrecedence: number = 0): UntypedExpression | undefined {
  if (tokens.length) {
    return firstResult([
      interpretParenthesis,
      buildLiteralExpression,
      interpretIdentifier,
      interpretFunctionCall,
      buildOperatorExpression,
    ], tokens, prevExpression, operatorPrecedence);
  }
}

export function interpretExpression(tokens: Token[], prevExpression: UntypedExpression | null = null, operatorPrecedence: number = 0): UntypedExpression | null {
  let result: UntypedExpression | undefined;
  let expressionPart = runExpressionBuilders(tokens, prevExpression, operatorPrecedence);
  while (expressionPart) {
    let unusedTokens = tokens.slice(expressionPart.tokens.length);
    result = expressionPart;
    expressionPart = runExpressionBuilders(unusedTokens, expressionPart, operatorPrecedence);
  }
  return result || null;
}

export function interpretSyntaxTree(tokens: Token[]): UntypedExpression[] {
  let expressions: UntypedExpression[] = [];
  let remainingTokens = tokens;
  while (remainingTokens.length) {
    let result = interpretExpression(remainingTokens)
      || makeUntypedUnrecognizedExpression(remainingTokens);
    expressions.push(result);

    remainingTokens = remainingTokens.slice(result.tokens.length);
    remainingTokens = remainingTokens;
  }
  return expressions;
}
