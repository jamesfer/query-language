import { Log } from './compiler/compiler-utils/monoids/log';
import { interpretSyntaxTree } from './compiler/interpret-expression';
import { tokenize } from './compiler/tokenizer/tokenize';
import { Message } from './message';
import { Token } from './token';
import { evaluateExpression } from './compiler/evaluate-expression';
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

export async function compile(code: string): Promise<CompilationResult> {
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
  // const scope: Scope = standardLibrary as any;
  const [state, , typedExpression] = await typeExpression({}, expression);
  log.append(state.messages);

  return {
    tokens,
    messages: log.getState(),
    expression: typedExpression,
    compiled: log.getState().length === 0,
  };
}

export async function evaluate(expression: Expression): Promise<EvaluationResult> {
  // TODO calling evaluate should use the compiled scope to prevent mismatches in the scope between type checking and evaluation
  // TODO the standard library is in the wrong format
  const [, , result] = await evaluateExpression({}, expression);
  return {
    result: await result(),
    messages: [],
    evaluated: true,
  };
}

export async function execute(code: string): Promise<ExecutionResult> {
  const compRes = await compile(code);
  if (!compRes.compiled || !compRes.expression) {
    return { evaluated: false, ...compRes };
  }

  const evalRes = await evaluate(compRes.expression);
  return {
    ...compRes,
    ...evalRes,
    messages: [...compRes.messages, ...evalRes.messages],
  };
}
