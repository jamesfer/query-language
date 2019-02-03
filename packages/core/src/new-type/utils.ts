export function arrayEqualBy<T>(left: T[], right: T[], comparator: (left: T, right: T) => boolean): boolean {
  return left.length === right.length
    && left.every((element, index) => comparator(element, right[index]))
}
