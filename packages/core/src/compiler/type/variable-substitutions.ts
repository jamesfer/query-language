import { assertNever } from '../../utils';
import { LazyValue, LazyValueList, ValueKind } from '../value';
import { mapValues } from 'lodash';
import { Type, TypeConstraint } from './type';

export interface VariableSubstitution {
  from: string;
  to: LazyValue;
}

export interface VariableSubstitutions {
  inferred: VariableSubstitution[];
  left: VariableSubstitution[];
  right: VariableSubstitution[];
}

export function makeSubstitutions(
  left: VariableSubstitution[] = [],
  right: VariableSubstitution[] = [],
  inferred: VariableSubstitution[] = [],
): VariableSubstitutions {
  return { left, right, inferred };
}

export const noSubstitutions = makeSubstitutions();

export function addLeftSubstitution(
  { left, right, inferred }: VariableSubstitutions,
  from: string,
  to: LazyValue,
): VariableSubstitutions {
  return {
    inferred,
    right,
    left: [...left, { from, to }],
  };
}

export function addInferredSubstitution(
  { left, right, inferred }: VariableSubstitutions,
  from: string,
  to: LazyValue,
): VariableSubstitutions {
  return {
    left,
    right,
    inferred: [...inferred, { from, to }],
  };
}

export function appendSubstitutions(
  first: VariableSubstitutions,
  second: VariableSubstitutions,
): VariableSubstitutions {
  return {
    left: [...first.left, ...second.left],
    right: [...first.right, ...second.right],
    inferred: [...first.inferred, ...second.inferred],
  };
}

export function applySubstitutionsToValueList(
  substitutions: VariableSubstitution[],
  iterable: LazyValueList,
  apply: (substitutions: VariableSubstitution[], value: LazyValue) => LazyValue,
): LazyValueList {
  return function * () {
    for (const value of iterable()) {
      yield apply(substitutions, value);
    }
  };
}

export function applySubstitutions(
  substitutions: VariableSubstitution[],
  unevaluatedValue: LazyValue,
): LazyValue {
  if (substitutions.length === 0) {
    return unevaluatedValue;
  }

  return async () => {
    const value = await unevaluatedValue();
    switch (value.kind) {
      case ValueKind.UnboundVariable: {
        const [{ from, to }, ...remainingSubstitutions] = substitutions;
        // Recursively apply all of the transformations
        return await applySubstitutions(
          remainingSubstitutions,
          from === value.name ? to : unevaluatedValue
        )();
      }

      case ValueKind.Boolean:
      case ValueKind.Integer:
      case ValueKind.Float:
      case ValueKind.String:
      case ValueKind.Anything:
      case ValueKind.Nothing:
      case ValueKind.NativeLambda:
      case ValueKind.UserDefinedLiteral:
      case ValueKind.BoundVariable:
        return value;

      case ValueKind.List:
        return {
          ...value,
          values: applySubstitutionsToValueList(substitutions, value.values, applySubstitutions),
        };

      case ValueKind.Record:
        return {
          ...value,
          values: mapValues(value.values, property => applySubstitutions(substitutions, property)),
        };

      case ValueKind.Application:
        return {
          ...value,
          callee: await applySubstitutions(substitutions, value.callee),
          parameters: applySubstitutionsToValueList(
            substitutions,
            value.parameters,
            applySubstitutions,
          ),
        };

      case ValueKind.Lambda:
        // TODO there's a possible bug in this code. If a variable in the body is a parameter, then it
        //      shouldn't be substituted. However, If a variable in the body isn't a parameter then it
        //      should be replaced and all variables in the replacements shouldn't consider the
        //      parameter list when being replaced. Eg:
        //      Either<A, B>, with a substitution list of A -> [B] and B -> C might end up as
        //      Either<[C], C> when it should really be Either<[B], C>
        return {
          ...value,
          body: await applySubstitutions(substitutions, value.body),
        };

      default:
        return assertNever(value);
    }
  };
}

export function applyInferredSubstitutions(
  substitutions: VariableSubstitution[],
  unevaluatedValue: LazyValue,
): LazyValue {
  if (substitutions.length === 0) {
    return unevaluatedValue;
  }

  return async () => {
    const value = await unevaluatedValue();
    switch (value.kind) {
      case ValueKind.BoundVariable: {
        const [{ from, to }, ...remainingSubstitutions] = substitutions;
        // Recursively apply all of the transformations
        return await applyInferredSubstitutions(
          remainingSubstitutions,
          from === value.name ? to : unevaluatedValue
        )();
      }

      case ValueKind.Boolean:
      case ValueKind.Integer:
      case ValueKind.Float:
      case ValueKind.String:
      case ValueKind.Anything:
      case ValueKind.Nothing:
      case ValueKind.NativeLambda:
      case ValueKind.UserDefinedLiteral:
      case ValueKind.UnboundVariable:
        return value;

      case ValueKind.List:
        return {
          ...value,
          values: applySubstitutionsToValueList(
            substitutions,
            value.values,
            applyInferredSubstitutions,
          ),
        };

      case ValueKind.Record:
        return {
          ...value,
          values: mapValues(value.values, property => applyInferredSubstitutions(
            substitutions,
            property,
          )),
        };

      case ValueKind.Application:
        return {
          ...value,
          callee: await applyInferredSubstitutions(substitutions, value.callee),
          parameters: applySubstitutionsToValueList(
            substitutions,
            value.parameters,
            applyInferredSubstitutions,
          ),
        };

      case ValueKind.Lambda:
        // TODO there's a possible bug in this code. If a variable in the body is a parameter, then it
        //      shouldn't be substituted. However, If a variable in the body isn't a parameter then it
        //      should be replaced and all variables in the replacements shouldn't consider the
        //      parameter list when being replaced. Eg:
        //      Either<A, B>, with a substitution list of A -> [B] and B -> C might end up as
        //      Either<[C], C> when it should really be Either<[B], C>
        return {
          ...value,
          body: await applyInferredSubstitutions(substitutions, value.body),
        };

      default:
        return assertNever(value);
    }
  };
}

export function applyAllSubstitutions(
  substitutions: VariableSubstitution[],
  inferredSubstitutions: VariableSubstitution[],
  value: LazyValue,
): LazyValue {
  return applySubstitutions(
    substitutions,
    applyInferredSubstitutions(inferredSubstitutions, value),
  );
}

export function applySubstitutionsToSubstitutions(
  substitutions: VariableSubstitution[][],
  previousSubstitutions: VariableSubstitution[],
): VariableSubstitution[] {
  return previousSubstitutions.map(({ from, to }) => ({
    from,
    to: substitutions.reduce((value, substitution) => applySubstitutions(substitution, value), to),
  }));
}

export function applyReplacementsToType(
  substitutions: VariableSubstitution[],
  inferredSubstitutions: VariableSubstitution[],
  type: Type,
): Type {
  return {
    kind: 'Type',
    value: applyAllSubstitutions(substitutions, inferredSubstitutions, type.value),
    constraints: type.constraints.map<TypeConstraint>(constraint => ({
      kind: 'TypeConstraint',
      child: applyAllSubstitutions(substitutions, inferredSubstitutions, constraint.child),
      parent: applyAllSubstitutions(substitutions, inferredSubstitutions, constraint.parent),
    })),
  };
}
