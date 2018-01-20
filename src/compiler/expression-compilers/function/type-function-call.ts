import { UntypedFunctionCallExpression } from 'untyped-expression';
import { filter, map, last } from 'lodash';
import { makeMessage, Message } from '../../../message';
import {
  applyGenericMap,
  createGenericMap,
  isTypeOf,
  makeFunctionType,
  Type,
} from '../../../type/type';
import {
  Expression,
  FunctionCallExpression,
} from '../../../expression';
import { typeExpression } from '../../type-expression';
import { TypedScope } from '../../../scope';

interface PartialApplication {
  expectedArgs: Type[],
  suppliedArgs: (Type | null)[],
  returnType: Type,
  genericMap: { [name: string]: Type },
}

function makeInitialPartial(funcType: Type | null): PartialApplication | null {
  if (funcType && funcType.kind === 'Function') {
    return {
      expectedArgs: funcType.argTypes,
      returnType: funcType.returnType,
      suppliedArgs: [],
      genericMap: {},
    };
  }
  return null;
}

function getNextArgType(partial: PartialApplication | null): Type | null {
  if (partial) {
    let nextArg = partial.expectedArgs[partial.suppliedArgs.length];
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
    let expectedArg = partial.expectedArgs[partial.suppliedArgs.length];
    partial.suppliedArgs.push(arg);
    partial.genericMap = {
      ...partial.genericMap,
      ...createGenericMap(expectedArg, arg),
    };
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
    unsuppliedArgs = map(unsuppliedArgs, arg => {
      return applyGenericMap(arg, partial.genericMap);
    });

    // Apply generic map to return type
    let returnType = applyGenericMap(partial.returnType, partial.genericMap);

    if (unsuppliedArgs.length) {
      return makeFunctionType(unsuppliedArgs, returnType);
    }
    return returnType;
  }
  return null;
}

export function typeFunctionCall(scope: TypedScope, expression: UntypedFunctionCallExpression): FunctionCallExpression {
  let funcExp = typeExpression(scope, expression.functionExpression);
  let funcType = funcExp.resultType;
  let messages: Message[] = [];
  if (funcType && funcType.kind !== 'Function') {
    messages.push(makeMessage(
      'Error',
      'Cannot call an expression that is not a function.',
      funcExp.tokens[0],
    ));
  }

  let partial = makeInitialPartial(funcType);
  let typedArgs: (Expression | null)[] = [];
  let index = -1;
  while (++index < expression.args.length) {
    let arg = expression.args[index];
    if (arg) {
      // The expected type of the argument
      // let expectedType = getNextArgType(partial);

      // Apply the next arg to the function signature
      let typedArg = typeExpression(scope, arg);
      partial = applyArg(partial, typedArg.resultType);

      // Check if the expected type matches the actual type
      let expectedType = getNextArgType(partial);
      if (expectedType && typedArg.resultType
        && !isTypeOf(expectedType, typedArg.resultType)) {
        typedArg.messages.push(makeMessage(
          'Error',
          'Argument has an incorrect type.',
          typedArg.tokens[0],
          last(typedArg.tokens),
        ));
      }

      typedArgs.push(typedArg);
    }
    else {
      partial = applyArg(partial, null);
    }
  }

  // Check if the number of arguments are correct.
  if (funcType && funcType.kind === 'Function' && typedArgs.length > funcType.argTypes.length) {
    messages.push(makeMessage(
      'Error',
      'Too many arguments supplied to function call.',
      expression.tokens[0],
      last(expression.tokens)
    ));
  }

  return {
    kind: expression.kind,
    functionExpression: funcExp,
    args: typedArgs,
    tokens: expression.tokens,
    resultType: inlineFunctionApplication(partial),
    messages: expression.messages.concat(messages),
  };
}
