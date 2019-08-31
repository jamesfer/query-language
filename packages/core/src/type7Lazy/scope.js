"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var variable_substitutions_1 = require("./type/variable-substitutions");
var lodash_1 = require("lodash");
function findVariableTypeInScope(scope, name) {
    if (scope.variables && name in scope.variables) {
        return scope.variables[name].valueType;
    }
    if (scope.parent) {
        return findVariableTypeInScope(scope.parent, name);
    }
    return undefined;
}
exports.findVariableTypeInScope = findVariableTypeInScope;
function createChildScope(parent, child) {
    return __assign({ parent: parent }, child);
}
exports.createChildScope = createChildScope;
// export function overrideTypes(scope: TypeScope, types: InferredTypes): TypeScope {
//   if (Object.keys(types).length === 0) {
//     return scope;
//   }
//
//   if (!scope.variables) {
//     return !scope.parent ? scope : { ...scope, parent: overrideTypes(scope.parent, types) };
//   }
//
//   return {
//     variables: mapValues(
//       scope.variables,
//       (entry: TypeScopeVariableEntry, name: string): TypeScopeVariableEntry => (
//         !(name in types) ? entry : { ...entry, valueType: types[name] }
//       ),
//     ),
//     ...!scope.parent ? {} : {
//       parent: overrideTypes(scope.parent, omit(types, Object.keys(scope.variables))),
//     },
//   };
// }
function applyInferredSubstitutionsToScope(scope, substitutions) {
    if (substitutions.length === 0) {
        return scope;
    }
    var variables = scope.variables
        ? lodash_1.mapValues(scope.variables, function (variable) { return (__assign({}, variable, { valueType: variable_substitutions_1.applyInferredSubstitutions(substitutions, variable.valueType) })); })
        : undefined;
    var newScope = variables ? { variables: variables } : {};
    if (!scope.parent) {
        return newScope;
    }
    var inferredVariables = scope.inferredVariables;
    var carriedSubstitutions = inferredVariables
        ? substitutions.filter(function (_a) {
            var from = _a.from;
            return !inferredVariables.includes(from);
        })
        : substitutions;
    return __assign({}, newScope, { parent: applyInferredSubstitutionsToScope(scope.parent, carriedSubstitutions) });
}
exports.applyInferredSubstitutionsToScope = applyInferredSubstitutionsToScope;
