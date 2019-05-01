import { Integer, LazyValue, List, NativeLambda } from './type';

function add(left: LazyValue<Integer>, right: LazyValue<Integer>): LazyValue {
  return async () => ({
    kind: 'Integer',
    value: (await left()).value + (await right()).value,
  });
}

function map(lazyList: LazyValue<List>, lazyIteratee: LazyValue<NativeLambda>): LazyValue {
  return async () => {
    const list = await lazyList();
    const iteratee = await lazyIteratee();
    return {
      kind: 'List',
      values: function * () {
        const iterable = list.values();
        for (const element of iterable) {
          yield iteratee.body(element);
        }
      },
    };
  }
}

function reduce(lazyList: LazyValue<List>, initial: LazyValue, lazyIteratee: LazyValue<NativeLambda>): LazyValue {
  return async () => {
    const list = await lazyList();
    const iteratee = await lazyIteratee();
    let result = initial;
    for (const element of list.values()) {
      result = iteratee.body(result, element);
    }
    return await result();
  }
}
