import {
  emptyInferredTypesScope,
  InferredTypesScope,
  expandInferredTypesScope,
} from '../../../type6Lazy/scope';
import { Monoid } from './monoid';

export class TypeVariables extends Monoid<InferredTypesScope> {
  static empty() {
    return new TypeVariables(emptyInferredTypesScope());
  }

  static from(variables: InferredTypesScope) {
    return new TypeVariables(variables);
  }

  static of<T>(value: T) {
    return { value, state: emptyInferredTypesScope() };
  }

  protected constructor(protected scope: InferredTypesScope) {
    super();
  }

  getState() {
    return this.scope;
  }

  append(other: InferredTypesScope): void {
    expandInferredTypesScope(this.scope, other);
  }
}
