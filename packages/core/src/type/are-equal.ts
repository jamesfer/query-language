import { assertNever } from '../utils';
import { Type } from './type';

export function areEqual(left: Type, right: Type): boolean {
  switch (left.kind) {
    case 'Integer':
    case 'Float':
    case 'String':
    case 'Boolean':
    case 'None':
      return left.kind === right.kind;

    case 'Array':
      return left.kind === right.kind && areEqual(left.elementType, right.elementType);

    case 'Function':
      // TODO check interface restrictions
      return left.kind === right.kind
        && left.argTypes.length === right.argTypes.length
        && left.argTypes.every((arg, index) => areEqual(arg, right.argTypes[index]));

    // case 'Interface':
    case 'Record':
      return false;

    case 'Variable':
      return true;

    default:
      return assertNever(left);
  }
}
