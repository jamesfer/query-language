function lazyList<T>(list: T[]) {
  return function * () {
    for (let i = 0; i < list.length; i++) {
      yield list[i];
    }
  };
}

function lazyElementList<T>(list: T[]) {
  return function * () {
    for (let i = 0; i < list.length; i++) {
      yield async () => list[i];
    }
  };
}
