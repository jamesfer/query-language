import { Log, LogValue } from './compiler-utils/monoids/log';

export function coalesceLogs<R>(functions: (() => LogValue<R | undefined>)[]): LogValue<R | undefined>;
export function coalesceLogs<R, P1>(functions: ((p1: P1) => LogValue<R | undefined>)[], p1: P1): LogValue<R | undefined>;
export function coalesceLogs<R, P1, P2>(functions: ((p1: P1, p2: P2) => LogValue<R | undefined>)[], p1: P1, p2: P2): LogValue<R | undefined>;
export function coalesceLogs<R, P1, P2, P3>(functions: ((p1: P1, p2: P2, p3: P3) => LogValue<R | undefined>)[], p1: P1, p2: P2, p3: P3): LogValue<R | undefined>;
export function coalesceLogs<R, P1, P2, P3, P4>(functions: ((p1: P1, p2: P2, p3: P3, p4: P4) => LogValue<R | undefined>)[], p1: P1, p2: P2, p3: P3, p4: P4): LogValue<R | undefined>;
export function coalesceLogs<R>(functions: ((...args: any[]) => LogValue<R | undefined>)[], ...args: any[]): LogValue<R | undefined> {
  const log = Log.empty();
  for (const func of functions) {
    const result = log.combine(func(...args));
    if (result !== undefined) {
      return log.wrap(result);
    }
  }
  return log.wrap(undefined);
}
