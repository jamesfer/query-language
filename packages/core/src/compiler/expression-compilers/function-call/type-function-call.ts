import { filter, flatMap, isEqual, last, map, uniqBy } from 'lodash';
import { UntypedFunctionCallExpression } from 'untyped-expression';
import { Expression, FunctionCallExpression } from '../../../expression';
import { makeMessage, Message } from '../../../message';
import { TypeScope, TypeVariableScope } from '../../../scope';
import { makeFunctionType, noneType } from '../../../type/constructors';
import { convergeTypes } from '../../../type/converge-types';
import { applyGenericMap, createGenericMap, Type } from '../../../type/type';
import { Log, LogValue } from '../../compiler-utils/monoids/log';
import { LogTypeScope, LogTypeScopeValue } from '../../compiler-utils/monoids/log-type-scope';
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

function typeFunctionCallee(
  scope: TypeScope,
  typeVariables: TypeVariableScope,
  expression: UntypedFunctionCallExpression,
): LogTypeScopeValue<Expression> {
  const logScope = LogTypeScope.fromVariables(typeVariables);

  // Determine the type of the callee
  const callee = expression.functionExpression;
  const funcExp = logScope.combine(typeExpression(scope, typeVariables, callee));
  const funcType = funcExp.resultType;

  if (funcType && funcType.kind !== 'Function') {
    logScope.push(makeMessage(
      'Error',
      'Cannot call an expression that is not a function.',
      funcExp.tokens[0],
    ));
  }

  return logScope.wrap(funcExp);
}

function typeFunctionCallArgs(
  expression: UntypedFunctionCallExpression,
  scope: TypeScope,
  typeVariables: TypeVariableScope,
  funcType: Type | null,
) {
  const logScope = LogTypeScope.fromVariables(typeVariables);
  let partial = makeInitialPartial(funcType);
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
    const typedArg = logScope.combine(typeExpression(scope, logScope.getScope(), arg));

    // Run type inference to narrow generic types
    let convergedType: Type | null = null;
    if (expectedType && typedArg.resultType) {
      convergedType = logScope.combine(
        convergeTypes(expectedType, typedArg.resultType, logScope.getScope())
      );
    }

    // Check if the expected type matches the actual type
    // TODO check that these messages are still correctly being printed
    if (!convergedType) {
      logScope.push(makeMessage(
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

  return logScope.wrap({
    args: typedArgs,
    resultType: inlineFunctionApplication(partial),
  });
}

function checkArgumentCount(
  funcType: Type | null,
  typedArgs: (Expression | any)[],
  expression: UntypedFunctionCallExpression,
): LogTypeScopeValue<void> {
  const logScope = LogTypeScope.empty();
  if (
    funcType
    && funcType.kind === 'Function'
    && typedArgs.length > funcType.argTypes.length
  ) {
    logScope.push(makeMessage(
      'Error',
      'Too many arguments supplied to function call.',
      expression.tokens[ 0 ],
      last(expression.tokens),
    ));
  }
  return logScope.wrap(undefined);
}

export const typeFunctionCall: ExpressionTyper<UntypedFunctionCallExpression> = (
  scope,
  typeVariables,
  expression,
) => {
  const logScope = LogTypeScope.fromVariables(typeVariables);

  // Type the function callee
  const funcExp = logScope.combine(typeFunctionCallee(scope, logScope.getScope(), expression));

  // Type each of the function args
  const { resultType, args } = logScope.combine(typeFunctionCallArgs(
    expression,
    scope,
    logScope.getScope(),
    funcExp.resultType,
  ));

  // Check if the number of arguments are correct.
  logScope.combine(checkArgumentCount(funcExp.resultType, args, expression));

  // TODO check if messages are being duplicated as previously they were
  return logScope.wrap<FunctionCallExpression>({
    resultType,
    args,
    kind: 'FunctionCall',
    functionExpression: funcExp,
    tokens: expression.tokens,
  });
};
