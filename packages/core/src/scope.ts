// import { areEqual } from './type/are-equal';
// import { InterfaceRestriction, Type } from './type/type';
// import { Expression, FunctionExpression } from './expression';
// import { Dictionary } from 'lodash';
//
// export interface TypeScope {
//   // The parent scope of this one
//   parent: TypeScope | null;
//   // A dictionary of variable identifiers and their types
//   variables: {
//     [k: string]: Type;
//   };
//
//   implementations: {
//     [k: string]: ({ parameters: Type[] } | string)[];
//   };
// }
//
// export function constructTypeScope(scope: Scope): TypeScope {
//   const variables: Dictionary<Type> = {};
//   for (const key in scope.variables) {
//     const type = scope.variables[key].resultType;
//     if (type) {
//       variables[key] = type;
//     }
//   }
//
//   const implementations: Dictionary<({ parameters: Type[] } | string)[]> = {};
//   for (const key in scope.interfaces) {
//     implementations[key] = scope.interfaces[key].map((iface) => (
//       typeof iface === 'string' ? iface : { parameters: iface.parameters }
//     ));
//   }
//
//   return { variables, implementations, parent: null };
// }
//
// /**
//  * Finds the given identifier in the scope or returns null if it can't be found.
//  */
// export function findTypeInScope(scope: TypeScope, identifier: string): Type | null {
//   if (scope.variables[identifier]) {
//     return scope.variables[identifier];
//   }
//   return !scope.parent ? null : findTypeInScope(scope.parent, identifier);
// }
//
// /**
//  * Creates a new scope with the given scope as it's parent. Effectively expands the current scope
//  * with new variables.
//  */
// export function expandTypeScope(
//   scope: TypeScope,
//   variables: { [k: string]: Type },
//   implementations: { [k: string]: { parameters: Type[] }[] } = {},
// ): TypeScope {
//   return { variables, implementations, parent: scope };
// }
//
// export function findScopeImplementationMatching(scope: TypeScope, name: string, argTypes: Type[]): string | undefined {
//   const implementations = scope.implementations[name];
//   if (implementations) {
//     const matchingIndex = implementations.findIndex((implementation) => {
//       if (typeof implementation === 'string') {
//         return false;
//       }
//
//       return implementation.parameters.every((parameter, index) => (
//         areEqual(parameter, argTypes[index])
//       ));
//     });
//
//     if (matchingIndex !== -1) {
//       return `${name}.${matchingIndex}`
//     }
//   }
// }
//
//
//
//
// export interface TypeVariableScope {
//   // A map of type variable's unique identifiers to their inferred type
//   variables: { [k: string]: Type };
//   // A map of interface parameters required to be implemented by a higher scope
//   interfaces: { [k: string]: InterfaceRestriction };
// }
//
// /**
//  * Creates a new, empty type variable scope.
//  */
// export function emptyTypeVariableScope(): TypeVariableScope {
//   return { variables: {}, interfaces: {} };
// }
//
// /**
//  * Finds the given type identifier in the type variable scope and returns it, or null if it couldn't
//  * be found.
//  */
// export function findTypeVariableInScope(scope: TypeVariableScope, type: string): Type | null {
//   let actualType: Type | null = scope.variables[type] || null;
//   while (actualType && actualType.kind === 'Variable') {
//     actualType = findTypeVariableInScope(scope, actualType.identifier);
//   }
//   return actualType;
// }
//
// /**
//  * Merges the existing type variable scope with new values.
//  */
// export function mergeTypeVariableScopes(
//   existingScope: TypeVariableScope,
//   newScope: TypeVariableScope,
// ): TypeVariableScope {
//   return {
//     variables: {
//       ...existingScope.variables,
//       ...newScope.variables,
//     },
//     interfaces: {
//       ...existingScope.interfaces,
//       ...newScope.interfaces,
//     },
//   };
// }
//
// /**
//  * Overwrites an existing scope with new values. This modifies the existing scope.
//  */
// export function overwriteTypeVariableScope(
//   existingScope: TypeVariableScope,
//   newScope: TypeVariableScope,
// ) {
//   Object.assign(existingScope.variables, newScope.variables);
//   Object.assign(existingScope.interfaces, newScope.interfaces);
// }
//
// /**
//  * Updates a single type variable in the scope.
//  * @param existingScope
//  * @param identifier
//  * @param type
//  */
// export function assignTypeVariableInScope(
//   existingScope: TypeVariableScope,
//   identifier: string,
//   type: Type,
// ): TypeVariableScope {
//   return mergeTypeVariableScopes(
//     existingScope,
//     { variables: { [identifier]: type }, interfaces: {} },
//   );
// }
//
// export function assignInterfaceInTypeVariableScope(
//   existingScope: TypeVariableScope,
//   identifier: string,
//   iface: InterfaceRestriction,
// ): TypeVariableScope {
//   return mergeTypeVariableScopes(
//     existingScope,
//     { variables: {}, interfaces: { [identifier]: iface } },
//   );
// }
//
// export function clearInterfacesFromTypeScope(existingScope: TypeVariableScope) {
//   return { variables: existingScope.variables, interfaces: {} }
// }
//
//
//
//
//
// export interface Implementation {
//   parameters: Type[];
//   fieldDefinitions: Dictionary<FunctionExpression>;
//   methodDefinitions: Dictionary<FunctionExpression>;
// }
//
// export type ImplementationReference = string;
//
// /**
//  * Full scope of the entire language. Everything that can be referenced by a
//  * name is stored in the scope. Each key is an identifier in the language and
//  * the entry can be a variable, function or interface.
//  */
// export interface Scope {
//   /**
//    * List of all available variables. Each variable must have a real value
//    * such as a number, string or function.
//    */
//   variables: {
//     [k: string]: Expression,
//   };
//   /**
//    * List of all available types. Each type refers to something that is entirely
//    * static in the program.
//    * TODO see if this can be removed
//    */
//   types: {
//     [k: string]: Type,
//   };
//   /**
//    * Dictionary of interface names and all their implementations
//    * TODO rename to implementations
//    */
//   interfaces: {
//     [k: string]: Implementation[];
//   };
//   /**
//    * Dictionary of variable names and their corresponding implementation.
//    * TODO rename to implementation variables
//    */
//   implementations: {
//     [k: string]: ImplementationReference | Implementation;
//   };
// }
//
// export function findScopeVariableEntry(scope: Scope, name: string): Expression | null {
//   // Search for a defined variable
//   const variable = scope.variables[name];
//   if (variable) {
//     return variable;
//   }
//
//   // Search for a method of an interface
//   // for (const typeName in scope.types) {
//   //   const type = scope.types[typeName];
//   //   if (type.kind === 'Interface') {
//   //     for (const methodName in type.methods) {
//   //       if (methodName === name) {
//   //         // TODO find a way to return a function expression that is polymorphic
//   //         return type.methods[methodName];
//   //       }
//   //     }
//   //   }
//   // }
//   return null;
// }
//
// export function findScopeVariableType(scope: Scope, name: string): Type | null {
//   const entry = findScopeVariableEntry(scope, name);
//   return entry ? entry.resultType : null;
// }
//
// export function expandScope(existingScope: Scope, newScope: Partial<Scope>): Scope {
//   return {
//     variables: {
//       ...existingScope.variables,
//       ...newScope.variables || {},
//     },
//     types: {
//       ...existingScope.types,
//       ...newScope.types || {},
//     },
//     interfaces: {
//       ...existingScope.interfaces,
//       ...newScope.interfaces || {},
//     },
//     implementations: {
//       ...existingScope.implementations,
//       ...newScope.implementations || {},
//     },
//   };
// }
//
// export function findImplementationInScope(scope: Scope, name: string): Implementation | null {
//   if (name.includes('.')) {
//     const [interfaceName, index] = name.split('.');
//     const iface = scope.interfaces[interfaceName];
//     if (iface) {
//       return iface[+index] || null;
//     }
//     return null;
//   }
//
//   const implementation = scope.implementations[name] || null;
//   if (typeof implementation === 'string') {
//     return findImplementationInScope(scope, implementation);
//   }
//   return implementation;
// }
//
// // export function findScopeType(scope: Scope, name: string): Type | null {
// //   return scope.types[name] || null;
// // }
