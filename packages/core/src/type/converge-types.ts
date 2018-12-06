import { LogTypeScope, LogTypeScopeValue } from '../compiler/compiler-utils/monoids/log-type-scope';
import {
  assignTypeVariableInScope,
  findTypeVariableInScope,
  TypeVariableScope,
} from '../scope';
import { assertNever } from '../utils';
import { makeArrayType, makeFunctionType } from './constructors';
import { Type } from './type';

export function convergeTypes(
  a: Type,
  b: Type,
  typeVariables: TypeVariableScope,
): LogTypeScopeValue<Type | null> {
  // Having the first argument as variable is easier to deal with. So swap them if b is varialbe and
  // a is not
  if (b.kind === 'Variable' && a.kind !== 'Variable') {
    return convergeTypes(b, a, typeVariables);
  }

  const logScope = LogTypeScope.fromVariables(typeVariables);
  switch (a.kind) {
    case 'None':
    case 'String':
      return logScope.wrap(b.kind === a.kind ? a : null);

    case 'Boolean': {
      // TODO a number should not be a subtype of boolean
      const isBoolean = b.kind === 'Boolean' || b.kind === 'Integer' || b.kind === 'Float';
      return logScope.wrap(isBoolean ? a : null);
    }

    case 'Integer':
    case 'Float':
      // TODO temporarily, all floats are considered integers until the float only functions are
      // TODO converted to interfaces
      return logScope.wrap(b.kind === 'Float' || b.kind === 'Integer' ? a : null);

    case 'Array':
      if (b.kind === 'Array') {
        const elementType = logScope.combine(
          convergeTypes(a.elementType, b.elementType, logScope.getScope()),
        );
        if (elementType) {
          return logScope.wrap(makeArrayType(elementType));
        }
      }
      return logScope.wrap(null);

    case 'Function':
      if (b.kind === 'Function' && b.argTypes.length === a.argTypes.length) {
        // Find the common types of all arguments
        let failedToConvergeArgs = false;
        const commonArgTypes = a.argTypes.map((argOfA, index) => {
          const commonType = logScope.combine(convergeTypes(
            argOfA,
            b.argTypes[index],
            logScope.getScope(),
          ));
          failedToConvergeArgs = failedToConvergeArgs || commonType === null;
          return commonType;
        });

        // Return null if any of the arguments failed to converge
        if (failedToConvergeArgs) {
          return logScope.wrap(null);
        }

        const commonBodyType = logScope.combine(convergeTypes(
          a.returnType,
          b.returnType,
          logScope.getScope(),
        ));
        if (!commonBodyType) {
          return logScope.wrap(null);
        }

        // While we performed a check above to ensure that none of the arguments were null,
        // Typescript still thinks that some arg types may be null. Hence the need for a typecast.
        return logScope.wrap(makeFunctionType(commonArgTypes as Type[], commonBodyType));
      }
      return logScope.wrap(null);

    case 'Variable': {
      const realAType = findTypeVariableInScope(logScope.getScope(), a.identifier);
      // if (b.kind !== 'Variable') {
        if (!realAType) {
          // If b is not a variable and a doesn't exist in the scope, then it should just be
          // assigned to b
          logScope.appendScope(assignTypeVariableInScope(logScope.getScope(), a.identifier, b));
          return logScope.wrap(b);
        }

        // If a does exist in the scope, then it needs to be converged with b
        const convergedType = logScope.combine(convergeTypes(realAType, b, logScope.getScope()));
        if (convergedType) {
          // If a and b successfully converge, then assign a to the converged type.
          logScope.appendScope(
            assignTypeVariableInScope(logScope.getScope(), a.identifier, convergedType)
          );
          return logScope.wrap(convergedType);
        }

        // If a and b don't successfully converge, just return null
        return logScope.wrap(null);
      // }
      // TODO may need to put extra logic in here for the cases where a and b are variables
    }

    // TODO
    case 'Interface':
    case 'Record':
      return logScope.wrap(null);

    default:
      return assertNever(a);
  }
}
//
// export function broadestCommonType(
//   a: Type | null,
//   b: Type | null,
//   genericScope: Dictionary<Type> = {},
// ): Type | null {
//   // Return null if either of the types are null
//   if (a === null || b === null) {
//     return null;
//   }
//
//   // Having the first argument as generic is easier to deal with. So swap them if b is generic and a
//   // isn't
//   if (a.kind !== 'Generic' && b.kind === 'Generic') {
//     return broadestCommonType(b, a);
//   }
//
//   switch (a.kind) {
//     case 'Array':
//       if (b.kind === 'Array') {
//         const elementType = broadestCommonType(a.elementType, b.elementType);
//         if (elementType) {
//           return makeArrayType(elementType);
//         }
//       }
//       return null;
//
//     case 'Function':
//       if (b.kind === 'Function' && b.argTypes.length === a.argTypes.length) {
//         const commonArgTypes = a.argTypes.map((argOfA, index) => (
//           broadestCommonType(argOfA, b.argTypes[index])
//         ));
//         if (commonArgTypes.some(arg => arg === null)) {
//           return null;
//         }
//
//         const commonBodyType = broadestCommonType(a.returnType, b.returnType);
//         if (!commonBodyType) {
//           return null;
//         }
//
//         // While we performed a check above to ensure that none of the arguments were null,
//         // Typescript still thinks that some arg types may be null. Hence the need for a typecast.
//         return makeFunctionType(commonArgTypes as Type[], commonBodyType);
//       }
//       return null;
//
//     case 'Generic':
//       if (b.kind !== 'Generic') {
//         // Doesn't work if a already inherits from something
//         return makeGenericType(a.name, b);
//       }
//
//
//
//     case 'None':
//     case 'String':
//     case 'Boolean':
//     case 'Integer':
//       return b.kind === a.kind ? a : null;
//
//     case 'Float':
//       // TODO eventually, an integer shouldn't be a subtype of float
//       return b.kind === a.kind || b.kind === 'Integer' ? a : null;
//
//     // TODO
//     case 'Interface':
//     case 'Record':
//       return null;
//
//     default:
//       return assertNever(a);
//   }
// }
