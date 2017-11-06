import { filter, map } from 'lodash';
import { makeMessage, Message } from '../../../message.model';
import { isTypeOf, makeFunctionType, Type } from '../../../type.model';
import {
  TypedExpression,
  TypedExpressionInterface,
} from '../../../typed-expression.model';
import { FunctionCallExpression } from '../../interpret/interpreters/function-call';
import { typeSyntaxTree } from '../type-expression';
import { TypedScope } from '../typed-scope.model';

export interface TypedFunctionCallExpression extends TypedExpressionInterface<'FunctionCall'> {
  functionExpression: TypedExpression;
  args: (TypedExpression | null)[];
}

// function applyArgument(scope: TypedScope, expression: Expression, functionType: FunctionType, resultType: FunctionType): { functionType: FunctionType, resultType: Type } {
//
// }
//
// function applyArguments(scope: TypedScope, args: (Expression | null)[], functionType: FunctionType) {
//
//   let arg1 = typeSyntaxTree(scope, args[0]);
// }

// export interface ApplicationResult {
//   expectedArgs: Type[],
//   returnType: Type,
//   skippedArgs: Type[],
//   genericMap: { [name: string]: Type },
// }
//
// function makeInitialApplicationResult(funcType: Type | null): ApplicationResult | null {
//   if (funcType && funcType.kind === 'Function') {
//     return {
//       expectedArgs: funcType.argTypes,
//       returnType: funcType.returnType,
//       skippedArgs: [],
//       genericMap: {},
//     };
//   }
// }
//
// function getFirstArgType(appRes: ApplicationResult | null): Type | null {
//   if (appRes) {
//     // TODO look up generic map.
//     return appRes.expectedArgs[0];
//   }
//   return null;
// }
//
// function expandFirstGenericArg(appRes: ApplicationResult | null, actualType: Type | null): ApplicationResult | null {
//   if (appRes && actualType) {
//     let expectedArg = appRes.expectedArgs[0];
//     if (expectedArg.kind === 'Generic') {
//       let expectedType = getFirstArgType(appRes) as Type;
//       if (!isTypeOf(expectedType, actualType) && isTypeOf(actualType, expectedType)) {
//         appRes.genericMap[expectedArg.name] = actualType;
//       }
//     }
//   }
//   return appRes;
// }
//
// function inlinePartialApplication(appRes: ApplicationResult | null): Type | null {
//   if (appRes) {
//     let remainingArgs = [
//       ...appRes.skippedArgs,
//       ...appRes.expectedArgs,
//     ];
//     if (remainingArgs.length === 0) {
//       return appRes.returnType;
//     }
//     else {
//       return makeFunctionType(remainingArgs, appRes.returnType);
//     }
//   }
//   return null;
// }

// function getArgType(funcType: Type | null, index: number = 0): Type | null {
//   if (funcType && funcType.kind === 'Function') {
//     return funcType.argTypes[index];
//   }
//   return null;
// }

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
    partial.suppliedArgs.push(arg);
    partial.genericMap = recalculateGenericMap(partial);
    return partial;
  }
  return null;
}

function recalculateGenericMap(partial: PartialApplication): { [name: string]: Type } {
  let index = -1;
  let argCount = Math.max(partial.expectedArgs.length, partial.suppliedArgs.length);
  let genericMap = {};

  while (++index < argCount) {
    let expectedArg = partial.expectedArgs[index];
    let suppliedArg = partial.suppliedArgs[index];

    if (expectedArg.kind === 'Generic' && suppliedArg) {
      if (genericMap[expectedArg.name] === undefined
        || isTypeOf(suppliedArg, genericMap[expectedArg.name])) {
        genericMap[expectedArg.name] = suppliedArg;
      }
    }
  }
  return genericMap;
}

function inlineFunctionApplication(partial: PartialApplication | null): Type | null {
  if (partial) {
    // Filter args that have been provided
    let unsuppliedArgs = filter(partial.expectedArgs, (arg, i) => {
      return !partial.suppliedArgs[i];
    });

    // Replace generic args with their actual type if known.
    unsuppliedArgs = map(unsuppliedArgs, arg => {
      if (arg.kind === 'Generic' && partial.genericMap[arg.name]) {
        return partial.genericMap[arg.name];
      }
      return arg;
    });

    if (unsuppliedArgs.length) {
      return makeFunctionType(unsuppliedArgs, partial.returnType);
    }
    return partial.returnType;
  }
  return null;
}

export function parseFunctionCallExpression(scope: TypedScope, expression: FunctionCallExpression): TypedFunctionCallExpression {
  let funcExp = typeSyntaxTree(scope, expression.functionExpression);
  let funcType = funcExp.resultType;
  let messages: Message[] = [];
  if (funcType && funcType.kind !== 'Function') {
    messages.push(makeMessage('Error', 'Cannot call an expression that is not a function.'));
  }

  let partial = makeInitialPartial(funcType);
  let typedArgs: (TypedExpression | null)[] = [];
  let index = -1;
  while (++index < expression.args.length) {
    let arg = expression.args[index];
    if (arg) {
      // The expected type of the argument
      // let expectedType = getNextArgType(partial);

      // Apply the next arg to the function signature
      let typedArg = typeSyntaxTree(scope, arg);
      partial = applyArg(partial, typedArg.resultType);

      // Check if the expected type matches the actual type
      let expectedType = getNextArgType(partial);
      if (expectedType && typedArg.resultType
        && !isTypeOf(expectedType, typedArg.resultType)) {
        typedArg.messages.push(makeMessage('Error', `Argument has an incorrect type.`));
      }

      typedArgs.push(typedArg);
    }
    else {
      partial = applyArg(partial, null);
    }
  }

  // Check if the number of arguments are correct.
  if (funcType && funcType.kind === 'Function' && typedArgs.length > funcType.argTypes.length) {
    messages.push(makeMessage('Error', 'Too many arguments supplied to function call.'));
  }

  return {
    kind: 'FunctionCall',
    functionExpression: funcExp,
    args: typedArgs,
    resultType: inlineFunctionApplication(partial),
    expression,
    messages,
  };

  // const args = map(expression.args, arg => arg ? typeSyntaxTree(scope, arg) : null);
  //
  // // Check type of arguments.
  // const functionType = funcExp.resultType;
  // if (functionType) {
  //   // Bail if function type is not a function
  //   // if (functionType.kind !== 'Function') {
  //   //   return {
  //   //     kind: 'FunctionCall',
  //   //     expression,
  //   //     resultType: null,
  //   //     messages: [makeMessage('Error', 'Cannot call an expression that is not a function.')],
  //   //     funcExp,
  //   //     args: []
  //   //   }
  //   // }
  //
  //   let messages: Message[] = [];
  //   let resultType: Type | null = null;
  //     if (functionType.kind === 'Function') {
  //       const maxArgs = Math.min(args.length, functionType.argTypes.length);
  //       let resultArgs: Type[] = [];
  //       let index = -1;
  //       while (++index < maxArgs) {
  //         const arg = args[index];
  //         if (arg) {
  //           if (arg.resultType && !isTypeOf(functionType.argTypes[index], arg.resultType)) {
  //             messages.push(makeMessage('Error', 'Argument ' + index + ' is not a compatible type.'));
  //           }
  //         }
  //         else {
  //           resultArgs.push(functionType.argTypes[index]);
  //         }
  //       }
  //
  //       // Check if there are too many arguments
  //       if (args.length > maxArgs) {
  //         messages.push(makeMessage('Error', 'Too many arguments were passed to function.'));
  //       }
  //
  //       // Determine the result type
  //       if (resultArgs.length) {
  //         resultType = {
  //           kind: 'Function',
  //           argTypes: resultArgs,
  //           returnType: functionType.returnType,
  //         };
  //       }
  //       else {
  //         resultType = functionType.returnType;
  //       }
  //     }
  //   else {
  //     messages.push(makeMessage('Error', 'Cannot call an expression that is not a function.'));
  //   }
  // }
  //
  // return {
  //   kind: 'FunctionCall',
  //   expression,
  //   resultType,
  //   messages: messages,
  //   funcExp,
  //   args,
  // };
}
