import { Token, TokenKind } from './token.model';

export declare function assertType<T>(x: T): never;
export function assertNever(x: never): never { return x; }

export function exhaustIterator<T>(it: Iterator<T>): T[] {
  let el: IteratorResult<T> = it.next();
  let arr: T[] = [];
  for (; !el.done; el = it.next()) {
    arr.push(el.value);
  }
  return arr;
}

export function firstResult<R>(functions: (() => R | undefined)[]): R | undefined;
export function firstResult<R, P1>(functions: ((p1: P1) => R | undefined)[], p1: P1): R | undefined;
export function firstResult<R, P1, P2>(functions: ((p1: P1, p2: P2) => R | undefined)[], p1: P1, p2: P2): R | undefined;
export function firstResult<R, P1, P2, P3>(functions: ((p1: P1, p2: P2, p3: P3) => R | undefined)[], p1: P1, p2: P2, p3: P3): R | undefined;
export function firstResult<R, P1, P2, P3, P4>(functions: ((p1: P1, p2: P2, p3: P3, p4: P4) => R | null)[], p1: P1, p2: P2, p3: P3, p4: P4): R | undefined;
export function firstResult<R>(functions: ((...args: any[]) => R | undefined)[], ...args: any[]): R | undefined;

export function firstResult<R>(functions: ((...args: any[]) => R | undefined)[], ...args: any[]): R | undefined {
  for (let func of functions) {
    let result = func(...args);
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
}


export function tokenArrayMatches(tokens: Token[], ...types: TokenKind[]): boolean {
  if (tokens.length < types.length) {
    return false;
  }

  let index = -1;
  while (++index < types.length) {
    if (tokens[index].kind !== types[index]) {
      return false;
    }
  }

  return true;
}

