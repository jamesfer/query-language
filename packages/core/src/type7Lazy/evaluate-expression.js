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
var expression_1 = require("./expression");
var state_1 = require("./type/state");
var utils_2 = require("./utils");
var value_1 = require("./value");
var value_constructors_1 = require("./value-constructors");
// TODO add scope
function evaluateExpression(scope, expression) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var state, _a, values, callee_1, parameters_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    state = state_1.State.of({});
                    _a = expression.kind;
                    switch (_a) {
                        case expression_1.ExpressionKind.Anything: return [3 /*break*/, 1];
                        case expression_1.ExpressionKind.Nothing: return [3 /*break*/, 2];
                        case expression_1.ExpressionKind.String: return [3 /*break*/, 3];
                        case expression_1.ExpressionKind.Integer: return [3 /*break*/, 4];
                        case expression_1.ExpressionKind.Float: return [3 /*break*/, 5];
                        case expression_1.ExpressionKind.Boolean: return [3 /*break*/, 6];
                        case expression_1.ExpressionKind.List: return [3 /*break*/, 7];
                        case expression_1.ExpressionKind.NativeLambda: return [3 /*break*/, 9];
                        case expression_1.ExpressionKind.Lambda: return [3 /*break*/, 10];
                        case expression_1.ExpressionKind.Application: return [3 /*break*/, 11];
                        case expression_1.ExpressionKind.Identifier: return [3 /*break*/, 14];
                        case expression_1.ExpressionKind.PolymorphicLambda: return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 16];
                case 1: return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.anything))];
                case 2: return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.nothing))];
                case 3: return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.string(expression.value)))];
                case 4: return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.integer(expression.value)))];
                case 5: return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.float(expression.value)))];
                case 6: return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.boolean(expression.value)))];
                case 7: return [4 /*yield*/, utils_2.pMap(expression.elements, state.runAsyncP1(evaluateExpression))];
                case 8:
                    values = _b.sent();
                    return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.list(utils_2.lazyList(values))))];
                case 9: return [2 /*return*/, state.wrap(value_constructors_1.lazyValue({
                        kind: value_1.ValueKind.NativeLambda,
                        parameterCount: expression.parameterCount,
                        body: expression.body
                    }))];
                case 10:
                    {
                        return [2 /*return*/, state.wrap(value_constructors_1.lazyValue({
                                kind: value_1.ValueKind.NativeLambda,
                                parameterCount: expression.parameterNames.length,
                                body: function () {
                                    var parameters = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        parameters[_i] = arguments[_i];
                                    }
                                    return function () { return __awaiter(_this, void 0, void 0, function () {
                                        var result;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, state.runAsync(evaluateExpression, expression.body)];
                                                case 1:
                                                    result = _a.sent();
                                                    return [4 /*yield*/, result()];
                                                case 2: return [2 /*return*/, _a.sent()];
                                            }
                                        });
                                    }); };
                                }
                            }))];
                    }
                    _b.label = 11;
                case 11: return [4 /*yield*/, state.runAsync(evaluateExpression, expression.callee)];
                case 12:
                    callee_1 = _b.sent();
                    return [4 /*yield*/, utils_2.pMap(expression.parameters, function (parameter) { return (state.runAsync(evaluateExpression, parameter)); })];
                case 13:
                    parameters_1 = _b.sent();
                    return [2 /*return*/, state.wrap(function () { return __awaiter(_this, void 0, void 0, function () {
                            var resolvedCallee, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, callee_1()];
                                    case 1:
                                        resolvedCallee = _b.sent();
                                        _a = resolvedCallee.kind;
                                        switch (_a) {
                                            case value_1.ValueKind.NativeLambda: return [3 /*break*/, 2];
                                            case value_1.ValueKind.Anything: return [3 /*break*/, 5];
                                            case value_1.ValueKind.Nothing: return [3 /*break*/, 5];
                                            case value_1.ValueKind.Integer: return [3 /*break*/, 5];
                                            case value_1.ValueKind.Float: return [3 /*break*/, 5];
                                            case value_1.ValueKind.String: return [3 /*break*/, 5];
                                            case value_1.ValueKind.Boolean: return [3 /*break*/, 5];
                                            case value_1.ValueKind.List: return [3 /*break*/, 5];
                                            case value_1.ValueKind.UserDefinedLiteral: return [3 /*break*/, 5];
                                            case value_1.ValueKind.Application: return [3 /*break*/, 5];
                                            case value_1.ValueKind.UnboundVariable: return [3 /*break*/, 5];
                                            case value_1.ValueKind.Lambda: return [3 /*break*/, 5];
                                            case value_1.ValueKind.BoundVariable: return [3 /*break*/, 5];
                                        }
                                        return [3 /*break*/, 6];
                                    case 2:
                                        if (!(parameters_1.length === resolvedCallee.parameterCount)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, resolvedCallee.body.apply(resolvedCallee, parameters_1)()];
                                    case 3: return [2 /*return*/, _b.sent()];
                                    case 4:
                                        if (parameters_1.length < resolvedCallee.parameterCount) {
                                            return [2 /*return*/, {
                                                    kind: value_1.ValueKind.NativeLambda,
                                                    parameterCount: resolvedCallee.parameterCount - parameters_1.length,
                                                    body: function () {
                                                        var args = [];
                                                        for (var _i = 0; _i < arguments.length; _i++) {
                                                            args[_i] = arguments[_i];
                                                        }
                                                        return resolvedCallee.body.apply(resolvedCallee, parameters_1.concat(args));
                                                    }
                                                }];
                                        }
                                        _b.label = 5;
                                    case 5: return [2 /*return*/, value_constructors_1.nothing];
                                    case 6: return [2 /*return*/, utils_1.assertNever(resolvedCallee)];
                                }
                            });
                        }); })];
                case 14: 
                // TODO look up in scope
                return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.nothing))];
                case 15: return [2 /*return*/, state.wrap(value_constructors_1.lazyValue(value_constructors_1.nothing))];
                case 16: return [2 /*return*/, utils_1.assertNever(expression)];
            }
        });
    });
}
exports.evaluateExpression = evaluateExpression;
