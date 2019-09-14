import { Expression, IdentifierExpression } from './expression';
import { TypeImplementation } from './type/type';

export interface EvaluationScopeVariableEntry {
  // The value of this variable. Each variable defined in a script should evaluate their
  // expression ahead of time to prevent having to do it multiple times when using it. This
  // could later be optimized using some memoization to only evaluate it once when first needed,
  // but that is out of scope for the moment.
  // TODO a type scope cannot contain this value because it doesn't know what values are
  // value: LazyValue;

  // The resolved value of this variable.
  value: Expression;

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

export interface EvaluationScope {
  /**
   * Parent of this scope.
   */
  parent?: EvaluationScope;

  /**
   * List of declared variables. This is where all functions, constants and types are defined.
   */
  variables?: {
    [k: string]: EvaluationScopeVariableEntry;
  };

  /**
   * List of implementations of an interface type.
   */
  // TODO these need to be named
  implementations?: {
    [k: string]: TypeImplementation,
  };
}

export function findVariableInScope2(scope: EvaluationScope, name: string): Expression | undefined {
  if (scope.variables && name in scope.variables) {
    return scope.variables[name].value;
  }

  if (scope.parent) {
    return findVariableInScope2(scope.parent, name);
  }

  return undefined;
}
