import { assertNever } from '../utils';
import { InterfaceConstraint, ParameterType, Type, TypeScope } from './type';

/**
 * Returns true if the subtype parameter type is a subtype or the same as the type.
 */
// export function isParameterSubtype(
//   scope: TypeScope,
//   type: ParameterType,
//   subtype: ParameterType,
//   typeInterfaceConstraints: InterfaceConstraint[] = [],
//   subtypeInterfaceConstraints: InterfaceConstraint[] = [],
// ): boolean {
//   switch (type.kind) {
//     case 'DataType':
//       return subtype.kind === 'DataType'
//         && type.name === subtype.name
//         && type.parameters.length === subtype.parameters.length
//         && type.parameters.every((parameter, index) => (
//           isParameterSubtype(
//             scope,
//             parameter,
//             subtype.parameters[index],
//             typeInterfaceConstraints,
//             subtypeInterfaceConstraints,
//           )
//         ));
//
//     case 'FunctionType':
//       return subtype.kind === 'FunctionType'
//         && type.parameters.length === subtype.parameters.length
//         && type.parameters.every((parameter, index) => (
//           isParameterSubtype(
//             scope,
//             subtype.parameters[index],
//             parameter,
//             subtypeInterfaceConstraints,
//             typeInterfaceConstraints,
//           )
//         ))
//         && isParameterSubtype(
//           scope,
//           type.result,
//           subtype.result,
//           typeInterfaceConstraints,
//           subtypeInterfaceConstraints,
//         );
//
//     case 'TypeVariable':
//       if (subtype.kind === 'TypeVariable') {
//         // Check if every constraint on the type is present on the subtype
//         return typeInterfaceConstraints.every((interfaceConstraint) => {
//           if (!interfaceConstraint.parameters.find(({ name }) => name === type.name)) {
//             // If the parameter is not mentioned in the interface constraint, then we can ignore it
//             return true;
//           }
//
//           // Search for the same constraint in the subtype
//           return subtypeInterfaceConstraints.some(subtypeInterfaceConstraint => (
//             // Check if the subtype interface constraint is the same as the type's interface constraint
//             subtypeInterfaceConstraint.name === interfaceConstraint.name
//             && subtypeInterfaceConstraint.parameters.length === interfaceConstraint.parameters.length
//             && interfaceConstraint.parameters.every((constraintParameter, index) => {
//               if (constraintParameter.kind === 'TypeVariable') {
//                 return constraintParameter.name !== type.name
//                   || subtypeInterfaceConstraint.parameters[index].name === subtype.name;
//               }
//
//               return isParameterSubtype(
//                 scope,
//                 constraintParameter,
//                 subtypeInterfaceConstraint.parameters[index],
//                 typeInterfaceConstraints,
//                 subtypeInterfaceConstraints,
//               );
//             })
//           ));
//         });
//       }
//
//       // Check if the data type satisfies the type variable constraints
//       return typeInterfaceConstraints.every((interfaceConstraint) => {
//         if (!interfaceConstraint.parameters.find(({ name }) => name === type.name)) {
//           // If the parameter is not mentioned in the interface constraint, then we can ignore it
//           return true;
//         }
//
//         const implementations = scope.implementations[interfaceConstraint.name];
//         if (!implementations) {
//           // If the interface doesn't have any implementations, then return false
//           return false;
//         }
//
//         // Replace all occurrences of the type parameter with the subtype one
//         const searchParameters = interfaceConstraint.parameters.map(parameter => (
//           parameter.name === type.name ? subtype : parameter
//         ));
//
//         // Find an implementation of the interface that matches the parameters
//         return implementations.some(implementation => {
//           return implementation.parameters.length === searchParameters.length
//             && implementation.parameters.every((parameter, index) => (
//               isParameterSubtype(scope, parameter, searchParameters[index], [
//                 ...subtypeInterfaceConstraints,
//                 ...implementation.interfaceConstraints,
//               ], typeInterfaceConstraints)
//             ));
//         });
//       });
//
//     default:
//       return assertNever(type);
//   }
// }

/**
 * Returns true if the subtype type is a subtype or the same type as the type.
 */
export function isSubtype(scope: TypeScope, type: Type, subtype: Type): boolean {
  return isParameterSubtype(
    scope,
    type.realType,
    subtype.realType,
    type.interfaceConstraints,
    subtype.interfaceConstraints,
  );
}
