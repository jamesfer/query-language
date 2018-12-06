import {
  emptyTypeVariableScope,
  overwriteTypeVariableScope,
  TypeVariableScope,
} from '../../../scope';
import { Monoid } from './monoid';

export class TypeVariables extends Monoid<TypeVariableScope> {
  static empty() {
    return new TypeVariables(emptyTypeVariableScope());
  }

  static from(variables: TypeVariableScope) {
    return new TypeVariables(variables);
  }

  static of<T>(value: T) {
    return { value, state: emptyTypeVariableScope() };
  }

  protected constructor(protected scope: TypeVariableScope) {
    super();
  }

  getState() {
    return this.scope;
  }

  append(other: TypeVariableScope): void {
    overwriteTypeVariableScope(this.scope, other);
  }
}
