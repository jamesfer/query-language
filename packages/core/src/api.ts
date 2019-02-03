import { isEqual, reduce, uniqWith, Dictionary } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { LogTypeScope } from './compiler/compiler-utils/monoids/log-type-scope';
import { Message } from './message';
import { convertToScope } from './library';
import { constructTypeScope, emptyTypeVariableScope, Scope } from './scope';
import { standardLibrary } from './standard-library/standard-library';
import { Token } from './token';
import { Expression } from './expression';
import { interpretSyntaxTree } from './compiler/interpret-expression';
import { typeExpression } from './compiler/type-expression';
import { evaluateSyntaxTree } from './compiler/evaluate-expression';
import { monotizeBaseExpression } from './compiler/monotize-expression';
import { tokenize } from './compiler/tokenizer/tokenize';
import { Type } from './type/type';
import { Log } from './compiler/compiler-utils/monoids/log';


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


type MessageContainer = { messages: Message[] };

function extractMessages(expressions: MessageContainer[]): Message[] {
  return reduce<MessageContainer, Message[]>(
    expressions,
    (list, exp) => list.concat(exp.messages),
    [],
  );
}

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
  const scope = convertToScope(standardLibrary);
  const typeScope = constructTypeScope(scope);
  const logScope = LogTypeScope.empty();
  const typedExpression = logScope.combine(typeExpression(
    typeScope,
    logScope.getScope(),
    expression,
  ));
  log.append(logScope.getLog());

  const result = { tokens, messages: log.getState(), expression: typedExpression };
  return {
    ...result,
    compiled: typedExpression.kind !== 'Unrecognized' && log.getState().length === 0,
  };
}

export function evaluate(expression: Expression): EvaluationResult {
  const evalScope = convertToScope(standardLibrary);
  return {
    messages: [],
    result: evaluateSyntaxTree(evalScope, expression),
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
