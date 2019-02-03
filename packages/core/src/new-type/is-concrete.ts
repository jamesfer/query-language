import { DataType, Type } from './type';

/**
 * Returns true if the parameter is concrete.
 */
export function isConcreteDataType(type: DataType): boolean {
  return typeof type.name === 'string' && type.parameters.every(isConcreteDataType);
}

/**
 * Returns true if the type is concrete.
 */
export function isConcrete(type: Type): boolean {
  return isConcreteDataType(type.realType);
}
