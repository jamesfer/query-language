import { uniqBy } from 'lodash';
import { assertNever } from '../../utils';
import { TypeScope } from '../scope';
import { pMap } from '../utils';
import { LazyValue, UnboundVariable, ValueKind } from '../value';
import { boundVariable, unboundVariable } from '../value-constructors';

function uniqueVariableList(variables: UnboundVariable[]) {
  return uniqBy(variables, 'name');
}

/**
 * Extracts the unbound variables from a value.
 */
export async function extractUnboundVariables(unresolvedValue: LazyValue): Promise<UnboundVariable[]> {
  const value = await unresolvedValue();
  switch (value.kind) {
    case ValueKind.Nothing:
    case ValueKind.Integer:
    case ValueKind.Float:
    case ValueKind.String:
    case ValueKind.Boolean:
    case ValueKind.Anything:
    case ValueKind.UserDefinedLiteral:
    case ValueKind.NativeLambda:
    case ValueKind.BoundVariable:
      return [];

    case ValueKind.UnboundVariable:
      return [value];

    case ValueKind.List:
      return extractUnboundVariablesFromList(Array.from(value.values()));

    case ValueKind.Record:
      return extractUnboundVariablesFromList(Object.values(value.values));

    case ValueKind.Application: {
      const calleeVariables = await extractUnboundVariables(value.callee);
      const parameterVariables = await extractUnboundVariablesFromList(
        Array.from(value.parameters())
      );
      return uniqueVariableList(calleeVariables.concat(...parameterVariables));
    }

    case ValueKind.Lambda:
      return (await extractUnboundVariables(value.body)).filter(variable => (
        !value.parameterNames.includes(variable.name)
      ));

    default:
      return assertNever(value);
  }
}

export async function extractUnboundVariablesFromList(values: LazyValue[]): Promise<UnboundVariable[]> {
  const elementVariables = await pMap(values, extractUnboundVariables);
  return uniqueVariableList(([] as UnboundVariable[]).concat(...elementVariables));
}

async function extractUnboundVariableNamesFromList(values: LazyValue[]): Promise<string[]> {
  const variables = await extractUnboundVariablesFromList(values);
  return variables.map(({ name }) => name);
}

function nonConflictingVariableName(existingVariables: string[], prefix: string): string {
  for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
    const newName = `${prefix}${i}`;
    if (!existingVariables.includes(newName)) {
      return newName;
    }
  }

  // The code should never reach this point unless under extremely exceptional circumstances.
  throw new Error('Failed to find a free variable name');
}

export async function freeVariableNameGenerator(existingValues: LazyValue[]) {
  const variableNames = await extractUnboundVariableNamesFromList(existingValues);
  return (prefix: string) => nonConflictingVariableName(variableNames, prefix);
}

export async function freeVariable(prefix: string, existingValues: LazyValue[]) {
  const variableNames = await extractUnboundVariableNamesFromList(existingValues);
  return unboundVariable(nonConflictingVariableName(variableNames, prefix));
}

export function freeBoundVariable(scope: TypeScope, prefix: string) {
  const scopeVariableNames = (scope: TypeScope | undefined, existing: string[] = []): string[] => (
    !scope
      ? existing
      : scopeVariableNames(scope.parent, [...existing, ...Object.keys(scope.variables || {})])
  );

  return boundVariable(nonConflictingVariableName(scopeVariableNames(scope), prefix));
}
