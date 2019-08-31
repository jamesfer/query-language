import { intersectionBy, flatMap } from 'lodash';
import { assertNever } from '../../utils';
import { TypeScope } from '../scope';
import { lazyList, reduceInto, zipIterators } from '../utils';
import { LazyValue, LazyValueList, ValueKind } from '../value';
import { application, lazyValue, list, unboundVariable } from '../value-constructors';
import { State, StateResult } from './state';
import {
  extractUnboundVariables,
  extractUnboundVariablesFromList, freeVariable,
  freeVariableNameGenerator,
} from './utils';
import {
  addInferredSubstitution,
  addLeftSubstitution,
  appendSubstitutions, applyInferredSubstitutions,
  applySubstitutions,
  makeSubstitutions,
  noSubstitutions,
  VariableSubstitution,
  VariableSubstitutions,
} from './variable-substitutions';

export type ConvergeResult<R = LazyValue> = [VariableSubstitutions, R | undefined];

const emptyConvergeResult: ConvergeResult<any> = [noSubstitutions, undefined];


/**
 * A list of substitutions can turn one expression into another one. But when the expression has
 * multiple sibling expressions, we need to ensure that the substitutions don't cause conflicts with
 * the other expressions. This function takes a list of substitutions and an expression and prepends
 * extra substitutions to any unbound variables in the expression that also exist on the right side
 * of any of the existing substitutions.
 */
async function preventOverlappingVariableSubstitutions(
  substitutions: VariableSubstitution[],
  unresolvedValue: LazyValue,
): Promise<VariableSubstitution[]> {
  const substitutionValues = substitutions.map(({ to }) => to);
  const existingVariables = await extractUnboundVariables(unresolvedValue);
  const newVariables = await extractUnboundVariablesFromList(substitutionValues);
  const nextName = await freeVariableNameGenerator([unresolvedValue, ...substitutionValues]);

  const overlappingVariables = intersectionBy(existingVariables, newVariables, 'name');
  const newSubstitutionMap = reduceInto(overlappingVariables, {}, (map, { name }) => {
    map[name] = nextName(name);
  });
  const newSubstitutions = overlappingVariables.map(({ name }) => ({
    from: name,
    to: lazyValue(unboundVariable(newSubstitutionMap[name])),
  }));
  const nonconflictingSubstitutions = substitutions.map(({ from, to }) => ({
    to,
    from: newSubstitutionMap[from] || from,
  }));

  return [
    ...newSubstitutions,
    ...nonconflictingSubstitutions,
  ];
}

/**
 * Takes two lists of values and tries to converge each element with it's corresponding value in the
 * other list, just like zip would. It also handles combining the substitutions between the
 * conversions so knowledge gained from converging the first elements can be applied to the last
 * element. For this to work, it is assumed that left and right belong to different scopes, but each
 * value inside a list belongs to the same scope.
 */
async function convergeLazyValueList(
  scope: TypeScope,
  left: LazyValueList,
  right: LazyValueList,
  previousSubstitutions: VariableSubstitutions,
): Promise<StateResult<ConvergeResult<LazyValueList>>> {
  const state = State.of(scope);
  const elements = zipIterators(left, right);
  const convergedElements = [];
  let accumulatedSubstitutions = previousSubstitutions;
  for (const [leftElement, rightElement] of elements()) {
    if (!leftElement || !rightElement) {
      return state.wrap(emptyConvergeResult);
    }

    const safeSubstitutions = await preventOverlappingVariableSubstitutions(
      accumulatedSubstitutions.left,
      leftElement,
    );
    const [newSubstitutions, converged] = await state.runAsync(
      convergeTypes,
      applyInferredSubstitutions(
        accumulatedSubstitutions.inferred,
        applySubstitutions(safeSubstitutions, leftElement),
      ),
      applyInferredSubstitutions(accumulatedSubstitutions.inferred, rightElement),
    );
    if (!converged) {
      return state.wrap(emptyConvergeResult);
    }

    const updatedInferredSubstitutions = accumulatedSubstitutions.inferred.map(({ from, to }) => ({
      from,
      to: applyInferredSubstitutions(
        newSubstitutions.inferred,
        applySubstitutions(newSubstitutions.left, to)
      ),
    }));
    accumulatedSubstitutions = appendSubstitutions(
      makeSubstitutions(safeSubstitutions, [], updatedInferredSubstitutions),
      newSubstitutions,
    );
    convergedElements.push(converged);
  }
  return state.wrap<ConvergeResult<LazyValueList>>([
    accumulatedSubstitutions,
    lazyList(convergedElements),
  ]);
}

/**
 * Converges two values into a common one or returns null if they cannot converge. This should take
 * the common elements of both types including the constraints and attempt to find a common type
 * between then. This will overwrite unbound types with more concrete ones as it goes.
 */
export async function convergeTypes(
  scope: TypeScope,
  lazyLeft: LazyValue,
  lazyRight: LazyValue,
): Promise<StateResult<ConvergeResult>> {
  const state = State.of(scope);
  const left = await lazyLeft();
  const right = await lazyRight();

  // Unbound variables are easier to handle on the left side
  if (left.kind !== ValueKind.BoundVariable) {
    if (
      right.kind === ValueKind.BoundVariable
        || right.kind === ValueKind.UnboundVariable && left.kind !== ValueKind.UnboundVariable
    ) {
      const [substitutions, result] = await state.runAsync(convergeTypes, lazyRight, lazyLeft);
      return state.wrap<ConvergeResult>([
        { left: substitutions.right, right: substitutions.left, inferred: substitutions.inferred },
        result,
      ]);
    }
  }


  switch (left.kind) {
    case ValueKind.Anything:
      return state.wrap<ConvergeResult>([noSubstitutions, lazyRight]);

    case ValueKind.Nothing:
      return state.wrap<ConvergeResult>([
        noSubstitutions,
        left.kind === right.kind ? lazyRight : undefined,
      ]);

    case ValueKind.Integer:
    case ValueKind.Float:
    case ValueKind.String:
    case ValueKind.Boolean:
      return state.wrap<ConvergeResult>([
        noSubstitutions,
        left.kind === right.kind && left.value === right.value ? lazyRight : undefined
      ]);

    case ValueKind.UserDefinedLiteral:
      return state.wrap<ConvergeResult>([
        noSubstitutions,
        left.kind === right.kind && left.name === right.name ? lazyRight : undefined
      ]);

    case ValueKind.BoundVariable:
      return state.wrap<ConvergeResult>([
        addInferredSubstitution(noSubstitutions, left.name, lazyRight),
        lazyRight,
      ]);

    case ValueKind.UnboundVariable:
      return state.wrap<ConvergeResult>([
        addLeftSubstitution(noSubstitutions, left.name, lazyRight),
        lazyRight,
      ]);

    case ValueKind.List: {
      if (right.kind !== ValueKind.List) {
        return state.wrap<ConvergeResult>([noSubstitutions, undefined]);
      }

      // Converge each of the list values together
      const [substitutions, convergedElements] = await state.runAsync(
        convergeLazyValueList,
        left.values,
        right.values,
        noSubstitutions,
      );

      return state.wrap<ConvergeResult>([
        substitutions,
        // Return undefined if any of the elements don't converge
        !convergedElements ? undefined : lazyValue(list(convergedElements))
      ]);
    }

    case ValueKind.Application: {
      if (right.kind !== ValueKind.Application) {
        return state.wrap<ConvergeResult>([noSubstitutions, undefined]);
      }

      // Converge the function callees
      const [calleeSubstitutions, convergedCallee] = await state.runAsync(
        convergeTypes,
        left.callee,
        right.callee,
      );
      if (!convergedCallee) {
        return state.wrap<ConvergeResult>([calleeSubstitutions, undefined]);
      }

      // Converge each of the parameters
      const [parameterSubstitutions, convergedParameters] = await state.runAsync(
        convergeLazyValueList,
        left.parameters,
        right.parameters,
        calleeSubstitutions,
      );
      if (!convergedParameters) {
        return state.wrap<ConvergeResult>([noSubstitutions, undefined]);
      }

      return state.wrap<ConvergeResult>([
        parameterSubstitutions,
        lazyValue(application(convergedCallee, convergedParameters))
      ]);
    }

    case ValueKind.Lambda:
    case ValueKind.NativeLambda:
      // TODO finish writing these implementations
      return state.wrap<ConvergeResult>([noSubstitutions, undefined]);

    default:
      return assertNever(left);
  }
}

export type ConvergeManyTypesResult = [
  VariableSubstitution[],
  VariableSubstitution[],
  VariableSubstitution[][],
  LazyValue | undefined
];

/**
 * Converges a list of values into a single one, handling the list of substitutions. It is assumed
 * that each element in the list belongs to a different scope.
 */
export async function convergeManyTypes(
  scope: TypeScope,
  values: LazyValue[],
): Promise<StateResult<ConvergeManyTypesResult>> {
  const state = State.of(scope);
  let combinedElementType: LazyValue = lazyValue(await freeVariable('T', values));
  const inferredSubstitutions: VariableSubstitution[][] = [];
  const combinedSubstitutions: VariableSubstitution[] = [];
  const elementSubstitutions: VariableSubstitution[][] = [];
  for (let i = 0; i < values.length; i++) {
    // Converge the current value with the accumulation
    const [substitutions, converged] = await state.runAsync(
      convergeTypes,
      combinedElementType,
      values[i],
    );
    if (!converged) {
      return state.wrap<ConvergeManyTypesResult>([[], [], [], undefined]);
    }

    inferredSubstitutions.push(substitutions.inferred);
    combinedSubstitutions.push(...substitutions.left);

    // Add the substitutions to every previous element in the list
    elementSubstitutions.forEach((previousSubstitutions) => {
      previousSubstitutions.push(...substitutions.left);
    });

    // Append this elements substitutions to the list
    elementSubstitutions.push(substitutions.right);

    combinedElementType = converged;
  }

  // Apply the regular substitutions to the inferred values
  const flatInferredSubstitutions = flatMap(inferredSubstitutions, (substitutions, index) => (
    substitutions.map(({ from, to }) => ({
      from,
      to: applySubstitutions(elementSubstitutions[index], to),
    }))
  ));

  return state.wrap<ConvergeManyTypesResult>([
    flatInferredSubstitutions,
    combinedSubstitutions,
    elementSubstitutions,
    combinedElementType,
  ]);
}

