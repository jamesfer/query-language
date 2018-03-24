import { some, reduce } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Message } from './message';
import { convertToScope } from './standard-library/library';
import { Scope } from './scope';
import { standardLibrary } from './standard-library/standard-library';
import { Token } from './token';
import { Expression } from './expression';
import { tokenizeCode } from './compiler/tokenize/tokenize-code';
import { interpretSyntaxTree } from './compiler/interpret-expression';
import { typeExpression } from './compiler/type-expression';
import { evaluateSyntaxTree } from './compiler/evaluate-expression';
import { monotizeBaseExpression } from './compiler/monotize-expression';


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
  let { tokens, messages, failed } = tokenizeCode(code);
  if (failed) {
    return { tokens, messages, compiled: false };
  }

  // Interpret expression
  const expressions = interpretSyntaxTree(tokens);
  const isUnrecognized = some(expressions, { kind: 'Unrecognized' });
  messages = [...messages, ...extractMessages(expressions)];
  if (expressions.length === 0 || messages.length > 0 || isUnrecognized) {
    return { tokens, messages, compiled: false };
  }

  // Type expression
  const typingScope = scope || convertToScope(standardLibrary);
  const typedExpression = typeExpression(typingScope, expressions[0]);
  messages = [...messages, ...typedExpression.messages];
  if (typedExpression.kind === 'Unrecognized' || messages.length > 0) {
    return {
      tokens,
      messages,
      expression: typedExpression,
      compiled: false,
    };
  }

  // Monotize expression (convert poly-types to mono-types)
  const monotypeExpression = monotizeBaseExpression(typedExpression);
  messages = [...messages, ...monotypeExpression.messages];
  const result = { tokens, messages, expression: monotypeExpression };
  if (monotypeExpression.kind === 'Unrecognized' || messages.length > 0) {
    return { ...result, compiled: false };
  }
  return { ...result, compiled: true };
}

export function evaluate(expression: Expression, scope?: Scope): EvaluationResult {
  scope = scope || convertToScope(standardLibrary);
  return {
    messages: [],
    result: evaluateSyntaxTree(scope, expression),
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
