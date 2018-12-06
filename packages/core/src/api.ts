import { isEqual, reduce, uniqWith, Dictionary } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { LogTypeScope } from './compiler/compiler-utils/monoids/log-type-scope';
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

export function compile(code: string, scope?: Scope): CompilationResult {
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
  const typingScope = scope || convertToScope(standardLibrary);
  // TODO don't manually construct scopes
  const typeScope: Dictionary<Type> = {};
  for (const key in typingScope.variables) {
    const type = typingScope.variables[key].resultType;
    if (type) {
      typeScope[key] = type;
    }
  }

  const logScope = LogTypeScope.empty();
  const typedExpression = logScope.combine(typeExpression(
    { parent: null, types: typeScope },
    { variables: {} },
    expression,
  ));
  log.append(logScope.getLog());

  // Monotize expression (convert poly-types to mono-types)
  const monotypeExpression = monotizeBaseExpression(typedExpression);

  const result = { tokens, messages: log.getState(), expression: monotypeExpression };
  return {
    ...result,
    compiled: monotypeExpression.kind !== 'Unrecognized' && log.getState().length === 0,
  };
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
