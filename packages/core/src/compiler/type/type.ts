import { LazyValue, UnboundVariable } from '../value';

export interface TypeConstraint {
  kind: 'TypeConstraint';
  child: LazyValue;
  parent: LazyValue;
}

export type TypeConstraints = TypeConstraint[];

export interface Type {
  kind: 'Type';
  value: LazyValue;
  constraints: TypeConstraints;
}

export function type(value: LazyValue, constraints: TypeConstraints = []): Type {
  return {
    value,
    constraints,
    kind: 'Type',
  };
}

export interface SubtypeRelationship {
  kind: 'SubtypeRelationship';
  parent: UnboundVariable;
  child: UnboundVariable;
}

export interface TypeImplementation {
  kind: 'TypeImplementation';
  parentType: LazyValue;
  childType: LazyValue;
  constraints: TypeConstraints;
}
