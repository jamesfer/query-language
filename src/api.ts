import { every, reduce } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { buildSyntaxTree } from './compile/interpret/interpret-expression';
import { parseTokens } from './compile/parse/parse-tokens';
import { typeSyntaxTree } from './compile/type/type-expression';
import { evaluateSyntaxTree } from './evaluate/evaluate-expression';
import { Message } from './message.model';
import { convertToScope } from './scope/library';
import {
  extractEvaluationScope,
  extractTypedScope,
  Scope,
} from './scope/scope';
import { standardLibrary } from './scope/standard-library';
import { Token } from './token.model';
import { Expression } from './expression.model';


export interface CompilationResult {
  messages: Message[],
  tokens: Token[],
  expression?: Expression,
  compiled: boolean,
}

export interface EvaluationResult {
  messages: Message[],
  result?: Observable<any>,
  evaluated: boolean,
}

export interface ExecutionResult extends CompilationResult, EvaluationResult {}


type MessageContainer = { messages: Message[] };

function extractMessages(expressions: MessageContainer[]): Message[] {
  return reduce<MessageContainer, Message[]>(expressions, (list, exp) => {
    return list.concat(exp.messages);
  }, []);
}

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
    result.messages = result.messages.concat(extractMessages(expressions));
    result.compiled = expressions.length !== 0
      && result.messages.length === 0
      && every(expressions, e => e.kind !== 'Unrecognized');

    // Type syntax tree
    if (expressions.length > 0) {
      scope = scope || convertToScope(standardLibrary);
      let typedScope = extractTypedScope(scope);
      let typedExpression = typeSyntaxTree(typedScope, expressions[0]);
      if (typedExpression.kind !== 'Unrecognized') {
        result.expression = typedExpression;
      }
      else {
        result.compiled = false;
      }
    }
  }
  return result;
}

export function evaluate(expression: Expression, scope?: Scope): EvaluationResult {
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
    } as ExecutionResult;
  }
  return compRes as ExecutionResult;
}
