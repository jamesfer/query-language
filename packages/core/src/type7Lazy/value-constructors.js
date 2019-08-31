"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var utils_1 = require("../utils");
var utils_2 = require("./utils");
var value_1 = require("./value");
function lazyValue(value) {
    return function () { return Promise.resolve(value); };
}
exports.lazyValue = lazyValue;
function userDefinedLiteral(name) {
    return {
        name: name,
        kind: value_1.ValueKind.UserDefinedLiteral
    };
}
exports.userDefinedLiteral = userDefinedLiteral;
// export function typeInterface(name: string): TypeInterface {
//   return {
//     name,
//     kind: ValueKind.TypeInterface,
//   };
// }
function unboundVariable(name) {
    return {
        name: name,
        kind: value_1.ValueKind.UnboundVariable,
        uniqueIdentifier: utils_1.uniqueIdentifier()
    };
}
exports.unboundVariable = unboundVariable;
function boundVariable(name) {
    return {
        name: name,
        kind: value_1.ValueKind.BoundVariable
    };
}
exports.boundVariable = boundVariable;
function lambda(parameterNames, body) {
    return {
        parameterNames: parameterNames,
        body: body,
        kind: value_1.ValueKind.Lambda
    };
}
exports.lambda = lambda;
function application(callee, parameters) {
    return {
        callee: callee,
        parameters: parameters,
        kind: value_1.ValueKind.Application
    };
}
exports.application = application;
function integer(value) {
    return {
        value: value,
        kind: value_1.ValueKind.Integer
    };
}
exports.integer = integer;
function float(value) {
    return {
        value: value,
        kind: value_1.ValueKind.Float
    };
}
exports.float = float;
function string(value) {
    return {
        value: value,
        kind: value_1.ValueKind.String
    };
}
exports.string = string;
function boolean(value) {
    return {
        value: value,
        kind: value_1.ValueKind.Boolean
    };
}
exports.boolean = boolean;
function list(values) {
    return {
        values: values,
        kind: value_1.ValueKind.List
    };
}
exports.list = list;
exports.anything = {
    kind: value_1.ValueKind.Anything
};
exports.nothing = {
    kind: value_1.ValueKind.Nothing
};
exports.stringType = userDefinedLiteral('string');
exports.integerType = userDefinedLiteral('integer');
exports.floatType = userDefinedLiteral('float');
exports.booleanType = userDefinedLiteral('boolean');
exports.listLiteralType = userDefinedLiteral('list');
function listType(elementType) {
    var _this = this;
    return application(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, exports.listLiteralType];
    }); }); }, utils_2.lazyList([elementType]));
}
exports.listType = listType;
exports.functionLiteralType = userDefinedLiteral('function');
function functionType() {
    // return application(lazyValue(functionLiteralType), lazyList(parameters))
    var parameters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parameters[_i] = arguments[_i];
    }
    // if (parameters.length < 2) {
    //   throw new Error('Cannot create lambda type with less than two parameters');
    // }
    var first = parameters[0], second = parameters[1], rest = parameters.slice(2);
    if (!first) {
        throw new Error('Cannot create a lambda type with no parameters');
    }
    if (!second) {
        return first;
    }
    return lazyValue(application(lazyValue(exports.functionLiteralType), rest.length === 0
        ? utils_2.lazyList([first, second])
        : utils_2.lazyList([first, functionType.apply(void 0, [second].concat(rest))])));
}
exports.functionType = functionType;
exports.implicitFunctionLiteralType = userDefinedLiteral('implicitFunction');
function implicitFunction(body) {
    var parameters = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        parameters[_i - 1] = arguments[_i];
    }
    return application(lazyValue(exports.implicitFunctionLiteralType), utils_2.lazyList([body].concat(parameters)));
}
exports.implicitFunction = implicitFunction;
