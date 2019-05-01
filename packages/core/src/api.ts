import { Observable } from 'rxjs/Observable';
import { LogTypeScope } from './compiler/compiler-utils/monoids/log-type-scope';
import { Message } from './message';
import { standardLibrary } from './standard-library/standard-library';
import { Token } from './token';
import { interpretSyntaxTree } from './compiler/interpret-expression';
import { typeExpression } from './compiler/type-expression';
import { evaluateSyntaxTree } from './compiler/evaluate-expression';
import { tokenize } from './compiler/tokenizer/tokenize';
import { Log } from './compiler/compiler-utils/monoids/log';
import { Expression } from './type6Lazy/expression';
import { Scope } from './type6Lazy/scope';


export interface CompilationResult {
  messages: Message[];
  tokens: Token[];
  expression?: Expression;
  compiled: boolean;
}

export interface EvaluationResult {
  messages: Message[];
  result?: Observable<any>;
  evaluated: boolean;
}

export interface ExecutionResult extends CompilationResult, EvaluationResult {}

export function compile(code: string): CompilationResult {
  const log = Log.empty();

  // Parse Tokens
  const tokens = tokenize(code);

  // Interpret expression
  const expressions = log.combine(interpretSyntaxTree(tokens));
  const [expression] = expressions;
  if (!expression) {
    return { tokens, messages: log.getState(), compiled: false };
  }

  // Type expression
  // TODO standard library is not in the right format
  const scope: Scope = standardLibrary as any;
  const logScope = LogTypeScope.empty();
  const typedExpression = logScope.combine(typeExpression(
    scope,
    logScope.getScope(),
    expression,
  ));
  log.append(logScope.getLog());

  const result = { tokens, messages: log.getState(), expression: typedExpression };
  return {
    ...result,
    compiled: log.getState().length === 0,
  };
}

export function evaluate(expression: Expression): EvaluationResult {
  // TODO calling evaluate should use the compiled scope to prevent mismatches in the scope between type checking and evaluation
  return {
    messages: [],
    // TODO the standard library is in the wrong format
    result: evaluateSyntaxTree(standardLibrary, expression),
    evaluated: true,
  };
}

export function execute(code: string): ExecutionResult {
  const compRes = compile(code);
  if (compRes.compiled && compRes.expression) {
    const evalRes = evaluate(compRes.expression);
    return {
      ...compRes,
      ...evalRes,
      messages: compRes.messages.concat(evalRes.messages),
    } as ExecutionResult;
  }
  return {
    evaluated: false,
    ...compRes,
  };
}
