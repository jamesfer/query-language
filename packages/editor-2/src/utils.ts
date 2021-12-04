export function assertNever(x: never): never {
  throw new Error(`Assert never was called with: ${x}`);
}
