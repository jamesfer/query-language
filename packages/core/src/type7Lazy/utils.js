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
function lazyList(list) {
    return function () {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < list.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, list[i]];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
}
exports.lazyList = lazyList;
function lazyElementList(list) {
    return function () {
        var _this = this;
        var _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (i) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                        return [2 /*return*/, list[i]];
                                    }); }); }];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < list.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
}
exports.lazyElementList = lazyElementList;
function zipIterators(left, right) {
    return function () {
        var leftIterator, rightIterator, leftResult, rightResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    leftIterator = left()[Symbol.iterator]();
                    rightIterator = right()[Symbol.iterator]();
                    leftResult = leftIterator.next();
                    rightResult = rightIterator.next();
                    _a.label = 1;
                case 1:
                    if (!(!leftResult.done || !rightResult.done)) return [3 /*break*/, 3];
                    return [4 /*yield*/, [leftResult.value, rightResult.value]];
                case 2:
                    _a.sent();
                    leftResult = leftIterator.next();
                    rightResult = rightIterator.next();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
}
exports.zipIterators = zipIterators;
function pIterateSome(list, iteratee) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, list_1, element;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, list_1 = list;
                    _a.label = 1;
                case 1:
                    if (!(_i < list_1.length)) return [3 /*break*/, 4];
                    element = list_1[_i];
                    return [4 /*yield*/, iteratee(element)];
                case 2:
                    if (_a.sent()) {
                        return [2 /*return*/, true];
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
exports.pIterateSome = pIterateSome;
function pSome(list, iteratee) {
    return __awaiter(this, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < list.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, iteratee(list[i], i, list)];
                case 2:
                    if (_a.sent()) {
                        return [2 /*return*/, true];
                    }
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
exports.pSome = pSome;
function pEvery(list, iteratee) {
    return __awaiter(this, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < list.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, iteratee(list[i], i, list)];
                case 2:
                    if (!(_a.sent())) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.pEvery = pEvery;
function pFilter(list, iteratee) {
    return __awaiter(this, void 0, void 0, function () {
        var result, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < list.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, iteratee(list[i])];
                case 2:
                    if (_a.sent()) {
                        result.push(list[i]);
                    }
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
exports.pFilter = pFilter;
function pMap(list, iteratee) {
    return __awaiter(this, void 0, void 0, function () {
        var result, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    result = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < list.length)) return [3 /*break*/, 4];
                    _b = (_a = result).push;
                    return [4 /*yield*/, iteratee(list[i])];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
exports.pMap = pMap;
function pMapValues(obj, iteratee) {
    return __awaiter(this, void 0, void 0, function () {
        var keys, result, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    keys = Object.keys(obj);
                    result = {};
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < keys.length)) return [3 /*break*/, 4];
                    _a = result;
                    _b = keys[i];
                    return [4 /*yield*/, iteratee(obj[keys[i]])];
                case 2:
                    _a[_b] = _c.sent();
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
exports.pMapValues = pMapValues;
function pReduce(list, initial, iteratee) {
    return __awaiter(this, void 0, void 0, function () {
        var aggregate, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    aggregate = initial;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < list.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, iteratee(aggregate, list[i], i)];
                case 2:
                    aggregate = _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, aggregate];
            }
        });
    });
}
exports.pReduce = pReduce;
function reduceInto(list, initial, iteratee) {
    var aggregate = initial;
    for (var i = 0; i < list.length; i++) {
        iteratee(aggregate, list[i], i);
    }
    return aggregate;
}
exports.reduceInto = reduceInto;
function splitAtLast(list) {
    return [list.slice(0, -1), list[list.length - 1]];
}
exports.splitAtLast = splitAtLast;
