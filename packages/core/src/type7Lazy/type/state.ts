import { Message } from '../../message';
import { TypeScope, applyInferredSubstitutionsToScope } from '../scope';
import { VariableSubstitution } from './variable-substitutions';

export interface StateObject {
  scope: TypeScope;
  messages: Message[];
}

export type StateResult<R> = [StateObject, VariableSubstitution[], R];

export class State {
  static of(scope: TypeScope): State {
    return new State({ scope, messages: [] });
  }

  static unwrap<T>([, , value]: StateResult<T>): T {
    return value;
  }

  wrap<T>(value: T): StateResult<T> {
    return [this.internalState, [], value];
  }

  wrapWithSubstitutions<T>(substitutions: VariableSubstitution[], value: T): StateResult<T> {
    return [this.internalState, substitutions, value];
  }

  scope() {
    return this.internalState.scope;
  }

  setScope(scope: TypeScope) {
    this.internalState.scope = scope;
  }

  getMessages() {
    return this.internalState.messages;
  }

  addMessage(message: Message) {
    this.internalState.messages.push(message);
  }

  log(message: Message) {
    this.internalState.messages.push(message);
  }

  run<R>(fn: (state: TypeScope) => StateResult<R>): R;
  run<T1, R>(fn: (state: TypeScope, a1: T1) => StateResult<R>, a1: T1): R;
  run<T1, T2, R>(fn: (state: TypeScope, a1: T1, a2: T2) => StateResult<R>, a1: T1, a2: T2): R;
  run<T1, T2, T3, R>(fn: (state: TypeScope, a1: T1, a2: T2, a3: T3) => StateResult<R>, a1: T1, a2: T2, a3: T3): R;
  run<T1, T2, T3, T4, R>(fn: (state: TypeScope, a1: T1, a2: T2, a3: T3, a4: T4) => StateResult<R>, a1: T1, a2: T2, a3: T3, a4: T4): R;
  run<T, R>(fn: (state: TypeScope, ...args: T[]) => StateResult<R>, ...args: T[]): R {
    return this.combine(fn(this.scope(), ...args));
  }

  runAsync<R>(fn: (state: TypeScope) => Promise<StateResult<R>>): Promise<R>;
  runAsync<T1, R>(fn: (state: TypeScope, a1: T1) => Promise<StateResult<R>>, a1: T1): Promise<R>;
  runAsync<T1, T2, R>(fn: (state: TypeScope, a1: T1, a2: T2) => Promise<StateResult<R>>, a1: T1, a2: T2): Promise<R>;
  runAsync<T1, T2, T3, R>(fn: (state: TypeScope, a1: T1, a2: T2, a3: T3) => Promise<StateResult<R>>, a1: T1, a2: T2, a3: T3): Promise<R>;
  runAsync<T1, T2, T3, T4, R>(fn: (state: TypeScope, a1: T1, a2: T2, a3: T3, a4: T4) => Promise<StateResult<R>>, a1: T1, a2: T2, a3: T3, a4: T4): Promise<R>;
  async runAsync<T, R>(fn: (state: TypeScope, ...args: T[]) => Promise<StateResult<R>>, ...args: T[]): Promise<R> {
    return this.combine(await fn(this.scope(), ...args));
  }

  runAsyncP1<T1, R>(fn: (state: TypeScope, arg1: T1) => Promise<StateResult<R>>): (arg1: T1) => Promise<R> {
    return arg1 => this.runAsync(fn, arg1);
  }

  runAsync1P1<T1, T2, R>(fn: (state: TypeScope, arg1: T1, arg2: T2) => Promise<StateResult<R>>, arg1: T1): (arg2: T2) => Promise<R> {
    return (arg2) => this.runAsync(fn, arg1, arg2);
  }

  runAsyncP2<T1, T2, R>(fn: (state: TypeScope, arg1: T1, arg2: T2) => Promise<StateResult<R>>): (arg1: T1, arg2: T2) => Promise<R> {
    return (arg1, arg2) => this.runAsync(fn, arg1, arg2);
  }

  combine<T>([newState, inferredTypes, result]: StateResult<T>): T {
    this.updateState(newState, inferredTypes);
    return result;
  }

  private constructor(private internalState: StateObject) {}

  private updateState(newState: StateObject, substitutions: VariableSubstitution[]) {
    this.internalState = {
      scope: newState.scope,
      messages: [...this.internalState.messages, ...newState.messages],
    };
  }
}
