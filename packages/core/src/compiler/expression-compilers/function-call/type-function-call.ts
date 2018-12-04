import { filter, flatMap, isEqual, last, map, uniqBy } from 'lodash';
import { UntypedFunctionCallExpression } from 'untyped-expression';
import { Expression } from '../../../expression';
import { makeMessage, Message } from '../../../message';
import { TypeScope, TypeVariableScope } from '../../../scope';
import { convergeTypes } from '../../../type/converge-types';
import { makeFunctionType, noneType } from '../../../type/constructors';
import { applyGenericMap, createGenericMap, Type } from '../../../type/type';
import { MessageResult, MessageStore } from '../../compiler-utils/message-store';
import { ExpressionTyper, typeExpression } from '../../type-expression';

interface PartialApplication {
  expectedArgs: Type[];
  suppliedArgs: (Type | null)[];
  returnType: Type;
  genericMap: { [name: string]: Type };
  // methodImplementations?: { [name: string]: Type },
}

function makeInitialPartial(funcType: Type | null): PartialApplication | null {
  if (funcType) {
    // if (funcType.kind === 'Method') {
    //   return {
    //     expectedArgs: funcType.signature.argTypes,
    //     returnType: funcType.signature.returnType,
    //     suppliedArgs: [],
    //     genericMap: {},
    //     methodImplementations: funcType.implementations,
    //   };
    // }
    if (funcType.kind === 'Function') {
      return {
        expectedArgs: funcType.argTypes,
        returnType: funcType.returnType,
        suppliedArgs: [],
        genericMap: {},
      };
    }
  }
  return null;
}

function getNextArgType(partial: PartialApplication | null): Type | null {
  if (partial) {
    const nextArg = partial.expectedArgs[partial.suppliedArgs.length];
    if (nextArg) {
      // if (nextArg.kind === 'Generic') {
      //   return partial.genericMap[nextArg.name];
      // }
      return nextArg;
    }
  }
  return null;
}

function applyArg(partial: PartialApplication | null, arg: Type | null): PartialApplication | null {
  if (partial) {
    const expectedArg = partial.expectedArgs[partial.suppliedArgs.length];
    partial.suppliedArgs.push(arg);
    partial.genericMap = {
      ...partial.genericMap,
      ...createGenericMap(expectedArg, arg),
    };

    // Reduce the number of possible implementations
    // if ('self' in partial.genericMap && partial.methodImplementations) {
    //   const selfType = partial.genericMap.self;
    //   partial.methodImplementations = pickBy(partial.methodImplementations, type => {
    //     return isTypeOf(type, selfType);
    //   })
    // }

    return partial;
  }
  return null;
}

function inlineFunctionApplication(partial: PartialApplication | null): Type | null {
  if (partial) {
    // Filter args that have been provided
    let unsuppliedArgs = filter(partial.expectedArgs, (arg, i) => {
      return !partial.suppliedArgs[i];
    });

    // Replace generic args with their actual type if known.
    unsuppliedArgs = map(unsuppliedArgs, arg => applyGenericMap(arg, partial.genericMap));

    // Apply generic map to return type
    const returnType = applyGenericMap(partial.returnType, partial.genericMap);

    if (unsuppliedArgs.length) {
      return makeFunctionType(unsuppliedArgs, returnType);
    }
    return returnType;
  }
  return null;
}

function typeFunctionCallee(scope: TypeScope, typeVariables: TypeVariableScope, expression: UntypedFunctionCallExpression)
: MessageResult<[TypeVariableScope, Expression]> {
  const [nextTypeVariables, funcExp] = typeExpression(scope, typeVariables, expression.functionExpression);
  const funcType = funcExp.resultType;
  const messages: Message[] = [...funcExp.messages];

  if (funcType && funcType.kind !== 'Function') {
    messages.push(makeMessage(
      'Error',
      'Cannot call an expression that is not a function.',
      funcExp.tokens[0],
    ));
  }

  return [[nextTypeVariables, funcExp], messages];
}

function typeFunctionCallArgs(
  expression: UntypedFunctionCallExpression,
  scope: TypeScope,
  typeVariables: TypeVariableScope,
  funcType: Type | null,
) {
  let partial = makeInitialPartial(funcType);
  let nextTypeVariables = typeVariables;
  const typedArgs: (Expression | null)[] = [];

  for (let index = 0; index < expression.args.length; index += 1) {
    const arg = expression.args[index];

    // If the argument is a placeholder, skip it.
    if (!arg) {
      partial = applyArg(partial, null);
      continue;
    }

    // Determine the argument's general type
    const expectedType = getNextArgType(partial);
    const [expressionVariables, typedArg] = typeExpression(scope, nextTypeVariables, arg);
    nextTypeVariables = expressionVariables;

    // Run type inference to narrow generic types
    let convergedType: Type | null = null;
    if (expectedType && typedArg.resultType) {
      const [convergedTypeVariables, actualConvergedType] = convergeTypes(expectedType, typedArg.resultType, nextTypeVariables);
      convergedType = actualConvergedType;
      nextTypeVariables = convergedTypeVariables;
    }

    // Check if the expected type matches the actual type
    // TODO check that these messages are still correctly being printed
    if (!convergedType) {
      typedArg.messages.push(makeMessage(
        'Error',
        'Argument has an incorrect type.',
        typedArg.tokens[0],
        last(typedArg.tokens),
      ));
    }

    // Apply argument to the function
    partial = applyArg(partial, convergedType || noneType);
    typedArgs.push(typedArg);
  }

  return {
    args: typedArgs,
    resultType: inlineFunctionApplication(partial),
    scope: nextTypeVariables,
  };
}

function checkArgumentCount(
  funcType: Type | null,
  typedArgs: (Expression | any)[],
  expression: UntypedFunctionCallExpression,
): Message | undefined {
  if (funcType && funcType.kind === 'Function'
    && typedArgs.length > funcType.argTypes.length) {
    return makeMessage(
      'Error',
      'Too many arguments supplied to function call.',
      expression.tokens[ 0 ],
      last(expression.tokens),
    );
  }
}

export const typeFunctionCall: ExpressionTyper<UntypedFunctionCallExpression> = (
  scope,
  typeVariables,
  expression,
) => {
  const messageStore = new MessageStore();
  let nextTypeVariables = typeVariables;

  // Type the function callee
  const [inferredVariables, funcExp] = messageStore.store(typeFunctionCallee(scope, nextTypeVariables, expression));
  nextTypeVariables = inferredVariables;

  // Type each of the function args
  const { resultType, args, scope: argsScope } = typeFunctionCallArgs(
    expression,
    scope,
    nextTypeVariables,
    funcExp.resultType,
  );
  nextTypeVariables = argsScope;

  // Check if the number of arguments are correct.
  messageStore.add(checkArgumentCount(funcExp.resultType, args, expression));

  // Add all argument messages to the messageStore
  const messages: Message[] = [
    ...expression.messages,
    ...messageStore.messages,
    ...flatMap(args, 'messages'),
  ];

  return [nextTypeVariables, {
    resultType,
    args,
    kind: 'FunctionCall',
    functionExpression: funcExp,
    tokens: expression.tokens,
    // TODO shouldn't need to unique messages
    messages: uniqBy(messages, isEqual),
  }];
};
