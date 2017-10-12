import { Token } from './token.model';
import { TypedExpression } from './typed-expression.model';
import { Message } from './message.model';
import { Value } from './value.model';
import {
  extractEvaluationScope, extractTypedScope,
  Scope,
} from './scope/scope';
import { parseTokens } from './parse-tokens/parse-tokens';
import { buildSyntaxTree } from './build-expression/build-expression';
import { some } from 'lodash';
import { typeSyntaxTree } from './type-expression/type-expression';
import { convertToScope } from './scope/library';
import { standardLibrary } from './scope/standard-library';
import { evaluateSyntaxTree } from './evaluate-expression/evaluate-expression';


export type CompilationResult = {
  messages: Message[],
  tokens: Token[],
  expression?: TypedExpression,
  compiled: boolean,
}

export interface EvaluationResult {
  messages: Message[],
  result?: Value,
  evaluated: boolean,
}

export type ExecutionResult = CompilationResult & Partial<EvaluationResult>;


export function compile(code: string, scope?: Scope): CompilationResult {
  // Parse Tokens
  let tokenResult = parseTokens(code);
  let result: CompilationResult = {
    messages: tokenResult.messages,
    tokens: tokenResult.tokens,
    compiled: !tokenResult.failed,
  };

  // Build syntax tree
  if (result.compiled) {
    let expressions = buildSyntaxTree(tokenResult.tokens);
    result.compiled = expressions.length !== 0
      && !some(expressions, e => e.kind === 'Unrecognized');

    // Type syntax tree
    if (result.compiled) {
      scope = scope || convertToScope(standardLibrary);
      let typedScope = extractTypedScope(scope);
      let typedExpression = typeSyntaxTree(typedScope, expressions[0]);
      if (typedExpression.kind !== 'Unrecognized') {
        result.compiled = true;
        result.expression = typedExpression;
      }
    }
  }
  return result;
}

export function evaluate(expression: TypedExpression, scope?: Scope): EvaluationResult {
  scope = scope || convertToScope(standardLibrary);
  let evalScope = extractEvaluationScope(scope);
  return {
    messages: [],
    result: evaluateSyntaxTree(evalScope, expression),
    evaluated: true,
  };
}

export function execute(code: string, scope?: Scope): ExecutionResult {
  let compRes = compile(code, scope);
  if (compRes.compiled && compRes.expression) {
    let evalRes = evaluate(compRes.expression, scope);

    return {
      ...compRes,
      ...evalRes,
      messages: compRes.messages.concat(evalRes.messages),
    };
  }
  return compRes;
}
