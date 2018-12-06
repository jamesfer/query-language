export type MonoidValue<S, T> = { state: S, value: T };

export abstract class Monoid<S> {
  abstract getState(): S;

  abstract append(state: S): void;

  wrap<T>(value: T): MonoidValue<S, T> {
    return { value, state: this.getState() };
  }

  combine<T>({ state, value }: MonoidValue<S, T>): T {
    this.append(state);
    return value;
  }
}

export interface MonoidStatic<M extends Monoid<S>, S> {
  empty(): M;
  of(state: S): M;
}
