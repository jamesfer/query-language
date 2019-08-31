export function lazyList<T>(list: T[]) {
  return function * () {
    for (let i = 0; i < list.length; i++) {
      yield list[i];
    }
  };
}

export function lazyElementList<T>(list: T[]) {
  return function * () {
    for (let i = 0; i < list.length; i++) {
      yield async () => list[i];
    }
  };
}

export function zipIterators<T, U>(
  left: () => Iterable<T>,
  right: () => Iterable<U>,
): () => Iterable<[T, U]> {
  return function * () {
    const leftIterator = left()[Symbol.iterator]();
    const rightIterator = right()[Symbol.iterator]();

    // Extract all left elements
    let leftResult = leftIterator.next();
    let rightResult = rightIterator.next();
    while (!leftResult.done || !rightResult.done) {
      yield [leftResult.value, rightResult.value];
      leftResult = leftIterator.next();
      rightResult = rightIterator.next();
    }
  }
}

export async function pIterateSome<T>(list: Iterable<T>, iteratee: (value: T) => Promise<boolean>) {
  for (const element of list) {
    if (await iteratee(element)) {
      return true;
    }
  }
  return false;
}

export async function pSome<T>(
  list: T[],
  iteratee: (element: T, index: number, list: T[]) => Promise<boolean>,
): Promise<boolean> {
  for (let i = 0; i < list.length; i++) {
    if (await iteratee(list[i], i, list)) {
      return true;
    }
  }
  return false;
}

export async function pEvery<T>(
  list: T[],
  iteratee: (element: T, index: number, list: T[]) => Promise<boolean>,
): Promise<boolean> {
  for (let i = 0; i < list.length; i++) {
    if (!await iteratee(list[i], i, list)) {
      return false;
    }
  }
  return true;
}

export async function pFilter<T>(
  list: T[],
  iteratee: (element: T) => Promise<boolean>,
): Promise<T[]> {
  const result = [];
  for (let i = 0; i < list.length; i++) {
    if (await iteratee(list[i])) {
      result.push(list[i]);
    }
  }
  return result;
}

export async function pMap<T, U>(
  list: T[],
  iteratee: (element: T) => Promise<U>,
): Promise<U[]> {
  const result = [];
  for (let i = 0; i < list.length; i++) {
    result.push(await iteratee(list[i]));
  }
  return result;
}

export async function pMapValues<T, U>(
  obj: { [k: string]: T },
  iteratee: (element: T) => Promise<U>,
): Promise<{ [k: string]: U }> {
  const keys = Object.keys(obj);
  const result = {};
  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = await iteratee(obj[keys[i]]);
  }
  return result;
}

export async function pReduce<R, T>(
  list: T[],
  initial: R,
  iteratee: (aggregate: R, element: T, index: number) => Promise<R>,
): Promise<R> {
  let aggregate = initial;
  for (let i = 0; i < list.length; i++) {
    aggregate = await iteratee(aggregate, list[i], i);
  }
  return aggregate;
}

export function reduceInto<R, T>(
  list: T[],
  initial: R,
  iteratee: (aggregate: R, element: T, index: number) => void,
): R {
  const aggregate = initial;
  for (let i = 0; i < list.length; i++) {
    iteratee(aggregate, list[i], i);
  }
  return aggregate;
}

export function splitAtLast<T>(list: T[]): [T[], T | undefined] {
  return [list.slice(0, -1), list[list.length - 1]];
}
