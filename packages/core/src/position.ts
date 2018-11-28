export type Position = [number, number];

export function addPositions(a: Position, offset: Position | number): Position {
  const b = typeof offset === 'number' ? [0, offset] : offset;
  return [
    a[0] + b[0],
    b[1] + (b[0] === 0 ? a[1] : 0),
  ];
}
