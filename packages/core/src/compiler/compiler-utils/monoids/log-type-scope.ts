import { Message } from '../../../message';
import { InferredTypesScope } from '../../../type6Lazy/scope';
import { Monoid, MonoidValue } from './monoid';
import { TypeVariables } from './type-variables';
import { Log } from './log';

export interface LogTypeScopeState {
  log: Log;
  scope: TypeVariables;
}

export type LogTypeScopeValue<T> = MonoidValue<LogTypeScopeState, T>;

export class LogTypeScope extends Monoid<LogTypeScopeState> {
  static empty() {
    return new LogTypeScope({ log: Log.empty(), scope: TypeVariables.empty() });
  }

  static of<T>(value: T) {
    return this.empty().wrap(value);
  }

  static from(state: LogTypeScopeState) {
    return new LogTypeScope(state);
  }

  static fromLog(log: Log) {
    return new LogTypeScope({ log, scope: TypeVariables.empty() });
  }

  static fromScope(scope: TypeVariables) {
    return new LogTypeScope({ scope, log: Log.empty() });
  }

  static fromVariables(variables: InferredTypesScope) {
    return this.fromScope(TypeVariables.from(variables));
  }

  static wrapWithVariables<T>(variables: InferredTypesScope, value: T) {
    return this.fromVariables(variables).wrap(value);
  }

  protected constructor(protected state: LogTypeScopeState) {
    super();
  }

  getState(): LogTypeScopeState {
    return this.state;
  }

  getScope(): InferredTypesScope {
    return this.state.scope.getState();
  }

  getLog(): Message[] {
    return this.state.log.getState();
  }

  append(state: LogTypeScopeState): void {
    this.state.log.append(state.log.getState());
    this.state.scope.append(state.scope.getState());
  }

  appendScope(variables: InferredTypesScope): void {
    this.append(LogTypeScope.fromVariables(variables).getState());
  }

  push(message: Message): void {
    this.state.log.push(message);
  }
}
