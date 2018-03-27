import { UntypedFunctionCallExpression } from 'untyped-expression';
import { filter, last, map, flatMap, uniqBy, isEqual } from 'lodash';
import { makeMessage, Message } from '../../../message';
import { Scope } from '../../../scope';
import { applyGenericMap, createGenericMap, Type } from '../../../type/type';
import { Expression, FunctionCallExpression } from '../../../expression';
import { typeExpression } from '../../type-expression';
import { isTypeOf } from '../../../type/is-type-of';
import { makeFunctionType } from '../../../type/constructors';
import { MessageResult, MessageStore } from '../../compiler-utils/message-store';

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
      if (nextArg.kind === 'Generic') {
        return partial.genericMap[nextArg.name];
      }
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

function typeFunctionCallee(scope: Scope, expression: UntypedFunctionCallExpression)
: MessageResult<Expression> {
  const funcExp = typeExpression(scope, expression.functionExpression);
  const funcType = funcExp.resultType;
  const messages: Message[] = [...funcExp.messages];

  if (funcType && funcType.kind !== 'Function') {
    messages.push(makeMessage(
      'Error',
      'Cannot call an expression that is not a function.',
      funcExp.tokens[0],
    ));
  }

  return [funcExp, messages];
}

function typeFunctionCallArgs(
  expression: UntypedFunctionCallExpression,
  scope: Scope,
  funcType: Type | null,
) {
  let partial = makeInitialPartial(funcType);
  const typedArgs: (Expression | null)[] = [];
  for (let index = 0; index < expression.args.length; index += 1) {
    const arg = expression.args[ index ];
    if (arg) {
      // The expected type of the argument
      // let expectedType = getNextArgType(partial);

      const typedArg = typeExpression(scope, arg);
      const expectedType = getNextArgType(partial);

      // Check if the expected type matches the actual type
      if (expectedType && typedArg.resultType
        && !isTypeOf(expectedType, typedArg.resultType)) {
        typedArg.messages.push(makeMessage(
          'Error',
          'Argument has an incorrect type.',
          typedArg.tokens[ 0 ],
          last(typedArg.tokens),
        ));
      }

      // Apply argument to the function
      partial = applyArg(partial, typedArg.resultType);
      typedArgs.push(typedArg);
    } else {
      partial = applyArg(partial, null);
    }
  }
  return {
    args: typedArgs,
    resultType: inlineFunctionApplication(partial),
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

export function typeFunctionCall(scope: Scope, expression: UntypedFunctionCallExpression)
: FunctionCallExpression {
  const messageStore = new MessageStore();

  // Type the function callee
  const result = typeFunctionCallee(scope, expression);
  const funcExp = messageStore.store(result);

  // Type each of the function args
  const { resultType, args } = typeFunctionCallArgs(expression, scope, funcExp.resultType);

  // Check if the number of arguments are correct.
  messageStore.add(checkArgumentCount(funcExp.resultType, args, expression));

  // Add all argument messages to the messageStore
  const messages: Message[] = [
    ...expression.messages,
    ...messageStore.messages,
    ...flatMap(args, 'messages'),
  ];

  return {
    resultType,
    args,
    kind: 'FunctionCall',
    functionExpression: funcExp,
    tokens: expression.tokens,
    messages: uniqBy(messages, isEqual),
  };
}
