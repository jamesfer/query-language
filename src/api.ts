import { every, reduce } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Message } from './message';
import { convertToScope } from './standard-library/library';
import {
  extractEvaluationScope,
  extractTypedScope,
  Scope,
} from './scope';
import { standardLibrary } from './standard-library/standard-library';
import { Token } from './token';
import { Expression } from './expression';
import { tokenizeCode } from './compiler/tokenize/tokenize-code';
import { interpretSyntaxTree } from './compiler/interpret-expression';
import { typeExpression } from './compiler/type-expression';
import { evaluateSyntaxTree } from './compiler/evaluate-expression';


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
  let tokenResult = tokenizeCode(code);
  let result: CompilationResult = {
    messages: tokenResult.messages,
    tokens: tokenResult.tokens,
    compiled: !tokenResult.failed,
  };

  // Build syntax tree
  if (result.compiled) {
    let expressions = interpretSyntaxTree(tokenResult.tokens);
    result.messages = result.messages.concat(extractMessages(expressions));
    result.compiled = expressions.length !== 0
      && result.messages.length === 0
      && every(expressions, e => e.kind !== 'Unrecognized');

    // Type syntax tree
    if (expressions.length > 0) {
      scope = scope || convertToScope(standardLibrary);
      let typedScope = extractTypedScope(scope);
      let typedExpression = typeExpression(typedScope, expressions[0]);
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
  return {
    evaluated: false,
    ...compRes
  };
}
