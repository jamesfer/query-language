import { Expression, IdentifierExpression } from './expression';
import { Type, TypeImplementation } from './type/type';
import {
  applyInferredSubstitutions,
  VariableSubstitution,
} from './type/variable-substitutions';
import { mapValues } from 'lodash';

export interface TypeScopeVariableEntry {
  // The value of this variable. Each variable defined in a script should evaluate their
  // expression ahead of time to prevent having to do it multiple times when using it. This
  // could later be optimized using some memoization to only evaluate it once when first needed,
  // but that is out of scope for the moment.
  // TODO a type scope cannot contain this value because it doesn't know what values are
  // value: LazyValue;

  // The resolved type of this variable.
  valueType: Type;

  // Information about how the variable was declared. Currently I believe that built in
  // variables will not have a declaration block, hence it's empty.
  declaration?: {
    // The expression where this identifier was declared. Useful in case we ever want to map an
    // identifier back to where it was defined.
    identifier: IdentifierExpression;

    // The expression of the value of the declaration.
    value: Expression;
    // TODO consider adding to every expression, a reference to the scope where it was defined.
    //      When evaluating expressions, they should always be done within their defined scope,
    //      rather than the scope of their usages.
  };
}

export interface TypeScope {
  /**
   * Parent of this scope.
   */
  parent?: TypeScope;

  /**
   * List of declared variables. This is where all functions, constants and types are defined.
   */
  variables?: {
    [k: string]: TypeScopeVariableEntry;
  };

  /**
   * The list of bound variables that were introduced at this scope level.
   */
  inferredVariables?: string[];

  /**
   * List of implementations of an interface type.
   */
  implementations?: {
    [k: string]: TypeImplementation,
  };

  //
  // /**
  //  * List of subtype relationships between types.
  //  */
  // subtypeRelationships?: SubtypeRelationship[];
}

export function findVariableTypeInScope(scope: TypeScope, name: string): Type | undefined {
  if (scope.variables && name in scope.variables) {
    return scope.variables[name].valueType;
  }

  if (scope.parent) {
    return findVariableTypeInScope(scope.parent, name);
  }

  return undefined;
}

export function createChildScope(parent: TypeScope, child: Pick<TypeScope, 'variables'>) {
  return {
    parent,
    ...child,
  };
}

// export function overrideTypes(scope: TypeScope, types: InferredTypes): TypeScope {
//   if (Object.keys(types).length === 0) {
//     return scope;
//   }
//
//   if (!scope.variables) {
//     return !scope.parent ? scope : { ...scope, parent: overrideTypes(scope.parent, types) };
//   }
//
//   return {
//     variables: mapValues(
//       scope.variables,
//       (entry: TypeScopeVariableEntry, name: string): TypeScopeVariableEntry => (
//         !(name in types) ? entry : { ...entry, valueType: types[name] }
//       ),
//     ),
//     ...!scope.parent ? {} : {
//       parent: overrideTypes(scope.parent, omit(types, Object.keys(scope.variables))),
//     },
//   };
// }

export function applyInferredSubstitutionsToScope(
  scope: TypeScope,
  substitutions: VariableSubstitution[]
): TypeScope {
  if (substitutions.length === 0) {
    return scope;
  }

  const variables = scope.variables
    ? mapValues(scope.variables, variable => ({
        ...variable,
        valueType: {
          ...variable.valueType,
          value: applyInferredSubstitutions(substitutions, variable.valueType.value),
        },
      }))
    : undefined;
  const newScope = variables ? { variables } : {};

  if (!scope.parent) {
    return newScope;
  }

  const inferredVariables = scope.inferredVariables;
  const carriedSubstitutions = inferredVariables
    ? substitutions.filter(({ from }) => !inferredVariables.includes(from))
    : substitutions;
  return {
    ...newScope,
    parent: applyInferredSubstitutionsToScope(scope.parent, carriedSubstitutions),
  };
}
