import { once } from 'lodash';

type Lazy<T> = () => Promise<T>;

interface Integer {
  kind: 'Integer';
  value: number;
}

interface ListA {
  kind: 'ListA';
  values: () => AsyncIterable<Value>;
}

interface ListB {
  kind: 'ListB';
  values: () => Iterable<Lazy<Value>>;
}

type Value =
  | ListA
  | ListB
  | Integer;



function rangeA(start: Lazy<Integer>, end: Lazy<Integer>): Lazy<ListA> {
  return once(async () => {
    const startValue = (await start()).value;
    const endValue = (await end()).value;
    return {
      kind: 'ListA',
      values: async function * () {
        for (let i = startValue; i < endValue; i++) {
          yield { kind: 'Integer', value: i };
        }
      },
    } as ListA;
  });
}

function rangeB(start: Lazy<Integer>, end: Lazy<Integer>): Lazy<ListB> {
  return once(async () => {
    const startValue = (await start()).value;
    const endValue = (await end()).value;
    return {
      kind: 'ListB',
      values: function * () {
        for (let i = startValue; i < endValue; i++) {
          yield async () => ({ kind: 'Integer', value: i });
        }
      },
    } as ListB;
  });
}


function mapA(iteratee: (element: Lazy<Value>) => Lazy<Value>, list: Lazy<ListA>): Lazy<ListA> {
  return once(async () => {
    const iterator = (await list()).values();
    return {
      kind: 'ListA',
      values: async function * () {
        for await (const element of iterator) {
          yield iteratee(async () => element)();
        }
      }
    } as ListA;
  });
}

function mapB(iteratee: (element: Lazy<Value>) => Lazy<Value>, list: Lazy<ListB>): Lazy<ListB> {
  return once(async () => {
    const iterator = (await list()).values();
    return {
      kind: 'ListB',
      values: function * () {
        for (const element of iterator) {
          yield iteratee(element);
        }
      }
    } as ListB;
  });
}
