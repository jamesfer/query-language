import { TypeVariableScope, findTypeVariableInScope } from '../scope';
import { Type } from './type';
import { assertNever } from '../utils';

export function isConcreteType(typeVariables: TypeVariableScope, type: Type): boolean {
  switch (type.kind) {
    case 'Integer':
    case 'Float':
    case 'String':
    case 'Boolean':
    case 'None':
      return true;

    case 'Array':
      return isConcreteType(typeVariables, type.elementType);

    case 'Function':
      return type.interfaceRestrictions.length === 0 && type.argTypes.every(arg => (
        isConcreteType(typeVariables, arg)
      ));

    case 'Variable':
      const actualType = findTypeVariableInScope(typeVariables, type.identifier);
      return !!actualType && isConcreteType(typeVariables, actualType);

    // case 'Interface':
    case 'Record':
      return false;

    default:
      return assertNever(type);
  }
}
