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

export function  buildExpression(tokens: Token[], prevExpression: Expression | null = null, operatorPrecedence: number = 0): Expression {
  let result: Expression | null = null;
  let expressionPart = runExpressionBuilders(tokens, prevExpression, operatorPrecedence);

  while (expressionPart) {
    let unusedTokens = tokens.slice(expressionPart.tokens.length);
    result = expressionPart;
    expressionPart = runExpressionBuilders(unusedTokens, expressionPart, operatorPrecedence);
  }

  if (!result) {
    console.log('Unrecognized');
    result = makeUnrecognizedExpression(tokens);
  }
  return result;
}

// TODO return a syntax tree object that can specify success or failure
export function buildSyntaxTree(tokens: Token[]): Expression {
  return buildExpression(tokens);
}
