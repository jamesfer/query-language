import { Token } from '../token.model';
import { Expression } from '../expression.model';
import { makeUnrecognizedExpression } from './parsers/unrecognized';
import { buildLiteralExpression } from './parsers/literal/literal';
import { firstResult } from '../utils';
import { buildFunctionCallExpression } from './parsers/function-call';
import { buildOperatorExpression } from './parsers/operator/operator';
import { buildIdentifierExpression } from './parsers/identifier';
import { buildParenthesisExpression } from './parsers/parenthesis';


function runExpressionBuilders(tokens: Token[], prevExpression: Expression | null = null, operatorPrecedence: number = 0): Expression | undefined {
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

export function buildExpression(tokens: Token[], prevExpression: Expression | null = null, operatorPrecedence: number = 0): Expression | null {
  let result: Expression | undefined;
  let expressionPart = runExpressionBuilders(tokens, prevExpression, operatorPrecedence);
  while (expressionPart) {
    let unusedTokens = tokens.slice(expressionPart.tokens.length);
    result = expressionPart;
    expressionPart = runExpressionBuilders(unusedTokens, expressionPart, operatorPrecedence);
  }
  return result || null;
}

export function buildSyntaxTree(tokens: Token[]): Expression[] {
  let expressions: Expression[] = [];
  let remainingTokens = tokens;
  while (remainingTokens.length) {
    let result = buildExpression(remainingTokens)
      || makeUnrecognizedExpression(remainingTokens);
    remainingTokens = remainingTokens.slice(result.tokens.length);
    expressions.push(result);
  }
  return expressions;
}
