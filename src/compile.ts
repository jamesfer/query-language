import { extractTypedScope, Scope } from './scope/scope';
import { Token } from './token.model';
import { Expression } from './expression.model';
import { TypedExpression } from './typed-expression.model';
import { Message } from './message.model';
import { parseTokens } from './parse-tokens/parse-tokens';
import { buildExpression } from './build-expression/build-expression';
import { typeSyntaxTree } from './type-expression/type-expression';

export type ParsedProgram = {
  tokens: Token[],
  messages: Message[],
}

export type BuiltProgram = ParsedProgram & {
  untypedExpression: Expression,
}

export type TypedProgram = BuiltProgram & {
  typedExpression: TypedExpression,
}

export type CompiledProgram =
  { stage: 'Parse' } & ParsedProgram
  | { stage: 'Build' } & BuiltProgram
  | { stage: 'Type' | 'Complete' } & TypedProgram


export function compile(code: string, scope: Scope): CompiledProgram {
  // Parsing
  let parseResult = parseTokens(code);
  let program: CompiledProgram = {
    stage: 'Parse',
    tokens: parseResult.tokens,
    messages: parseResult.messages,
  };
  if (parseResult.failed) {
    return program;
  }

  // Building
  let buildResult = buildExpression(parseResult.tokens);
  program = {
    ...program,
    stage: 'Build',
    untypedExpression: buildResult,
    // TODO merge messages
  };

  // Typing
  let typeResult = typeSyntaxTree(extractTypedScope(scope), program.untypedExpression);
  program = {
    ...program,
    stage: 'Complete',
    typedExpression: typeResult,
    // TODO merge messages
  };
  return program;
}
