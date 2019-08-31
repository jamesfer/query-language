"use strict";
exports.__esModule = true;
var ExpressionKind;
(function (ExpressionKind) {
    ExpressionKind[ExpressionKind["Anything"] = 0] = "Anything";
    ExpressionKind[ExpressionKind["Nothing"] = 1] = "Nothing";
    ExpressionKind[ExpressionKind["Application"] = 2] = "Application";
    ExpressionKind[ExpressionKind["Identifier"] = 3] = "Identifier";
    ExpressionKind[ExpressionKind["Lambda"] = 4] = "Lambda";
    ExpressionKind[ExpressionKind["NativeLambda"] = 5] = "NativeLambda";
    ExpressionKind[ExpressionKind["PolymorphicLambda"] = 6] = "PolymorphicLambda";
    ExpressionKind[ExpressionKind["Integer"] = 7] = "Integer";
    ExpressionKind[ExpressionKind["Float"] = 8] = "Float";
    ExpressionKind[ExpressionKind["String"] = 9] = "String";
    ExpressionKind[ExpressionKind["Boolean"] = 10] = "Boolean";
    ExpressionKind[ExpressionKind["List"] = 11] = "List";
})(ExpressionKind = exports.ExpressionKind || (exports.ExpressionKind = {}));
