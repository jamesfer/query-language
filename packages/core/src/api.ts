import { isEqual, reduce, uniqWith } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Message } from './message';
import { convertToScope } from './standard-library/library';
import { Scope } from './scope';
import { standardLibrary } from './standard-library/standard-library';
import { Token } from './token';
import { Expression } from './expression';
import { interpretSyntaxTree } from './compiler/interpret-expression';
import { typeExpression } from './compiler/type-expression';
import { evaluateSyntaxTree } from './compiler/evaluate-expression';
import { monotizeBaseExpression } from './compiler/monotize-expression';
import { tokenize } from './compiler/tokenizer/tokenize';


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

export function compile(code: string, scope?: Scope): CompilationResult {
  // Parse Tokens
  const tokens = tokenize(code);

  // Interpret expression
  const expressions = interpretSyntaxTree(tokens);
  const [expression] = expressions;
  let messages = extractMessages(expressions);
  if (!expression) {
    return { tokens, messages, compiled: false };
  }

  // Type expression
  const typingScope = scope || convertToScope(standardLibrary);
  const typedExpression = typeExpression(typingScope, expression);
  messages = [...messages, ...typedExpression.messages];

  // Monotize expression (convert poly-types to mono-types)
  const monotypeExpression = monotizeBaseExpression(typedExpression);
  messages = [...messages, ...monotypeExpression.messages];
  // TODO we should not have to unique the arrays before returning them
  // TODO need a better protocol when generating messages in each step
  messages = uniqWith(messages, isEqual);
  const result = { tokens, messages, expression: monotypeExpression };
  if (monotypeExpression.kind === 'Unrecognized' || messages.length > 0) {
    return { ...result, compiled: false };
  }
  return { ...result, compiled: true };
}

export function evaluate(expression: Expression, scope?: Scope): EvaluationResult {
  const evalScope = scope || convertToScope(standardLibrary);
  return {
    messages: [],
    result: evaluateSyntaxTree(evalScope, expression),
    evaluated: true,
  };
}

export function execute(code: string, scope?: Scope): ExecutionResult {
  const compRes = compile(code, scope);
  if (compRes.compiled && compRes.expression) {
    const evalRes = evaluate(compRes.expression, scope);

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
