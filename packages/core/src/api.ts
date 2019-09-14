import { Log } from './compiler/compiler-utils/monoids/log';
import { interpretSyntaxTree } from './compiler/interpret-expression';
import { tokenize } from './compiler/tokenizer/tokenize';
import {
  convertToEvaluationScope,
  convertToTypeScope,
  UniversalScope,
} from './compiler/universal-scope';
import { convertToScope } from './library';
import { Message } from './message';
import standardLibrary from './standard-library/standard-library';
import { Token } from './token';
import { evaluateExpression2 } from './compiler/evaluate-expression';
import { Expression } from './compiler/expression';
import { typeExpression } from './compiler/type/type-expression';
import { Value } from './compiler/value';

export interface CompilationResult {
  messages: Message[];
  tokens: Token[];
  expression?: Expression;
  compiled: boolean;
}

export interface EvaluationResult {
  messages: Message[];
  result?: Value;
  evaluated: boolean;
}

export interface ExecutionResult extends CompilationResult, EvaluationResult {}

export async function compile(code: string, scope: UniversalScope): Promise<CompilationResult> {
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
  const [state, , typedExpression] = await typeExpression(convertToTypeScope(scope), expression);
  log.append(state.messages);

  return {
    tokens,
    messages: log.getState(),
    expression: typedExpression,
    compiled: log.getState().length === 0,
  };
}

export async function evaluate(expression: Expression, scope: UniversalScope): Promise<EvaluationResult> {
  // TODO calling evaluate should use the compiled scope to prevent mismatches in the scope between type checking and evaluation
  // TODO the standard library is in the wrong format
  const result = await evaluateExpression2(convertToEvaluationScope(scope), expression, []);
  return {
    result: await result(),
    messages: [],
    evaluated: true,
  };
}

export async function execute(
  code: string,
  scope: UniversalScope = convertToScope(standardLibrary),
): Promise<ExecutionResult> {
  const compRes = await compile(code, scope);
  if (!compRes.compiled || !compRes.expression) {
    return { evaluated: false, ...compRes };
  }

  const evalRes = await evaluate(compRes.expression, scope);
  return {
    ...compRes,
    ...evalRes,
    messages: [...compRes.messages, ...evalRes.messages],
  };
}
