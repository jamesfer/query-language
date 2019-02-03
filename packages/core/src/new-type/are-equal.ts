import { Scope } from '../scope';
import { ParameterType, Type } from './type';

export function areTypeParametersEqual(
  scope: Scope,
  left: ParameterType,
  right: ParameterType,
): boolean {
  switch (left.kind) {
    case 'TypeVariable':


    case 'DataType':
      return right.kind === 'DataType'
        && left.name === right.name
        && left.parameters.length === right.parameters.length
        && left.parameters.every((leftParameter, index) => {
          return areTypeParametersEqual(scope, leftParameter, right.parameters[index]);
        });


  }
}

export function areTypesEqual(scope: Scope, left: Type, right: Type): boolean {
  switch (left.realType.kind) {
    case 'DataType':
      return
  }
}
