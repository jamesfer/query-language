"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("codemirror/addon/comment/comment");
const rules_1 = require("query-language/src/compiler/tokenizer/rules");
const query_language_1 = require("query-language");
const utils_1 = require("./utils");
class Highlighter {
    constructor(config, modeOptions) {
        this.config = config;
        this.modeOptions = modeOptions;
        this.lineComment = '--';
    }
    token(stream, state) {
        if (stream.eatSpace()) {
            return null;
        }
        const tokenKind = this.nextTokenKind(stream);
        if (tokenKind !== undefined) {
            return this.mapTokenKindToStyle(tokenKind);
        }
        // Unknown token
        stream.eat(/./);
        return null;
    }
    nextTokenKind(stream) {
        for (const tokenType in rules_1.default) {
            if (this.matchTokenPattern(stream, rules_1.default[tokenType])) {
                return tokenType;
            }
        }
    }
    matchTokenPattern(stream, test) {
        if (typeof test === 'string') {
            return !!stream.match(test);
        }
        if (test instanceof RegExp) {
            const testString = test.toString().replace(/^\/\^*/, '/^');
            return !!stream.match(new RegExp(testString));
        }
        return this.matchTokenPattern(stream, test.match);
    }
    mapTokenKindToStyle(kind) {
        switch (kind) {
            case query_language_1.TokenKind.Keyword:
                return 'keyword';
            case query_language_1.TokenKind.Identifier:
                return 'variable-3';
            case query_language_1.TokenKind.IntegerLiteral:
            case query_language_1.TokenKind.FloatLiteral:
                return 'number';
            case query_language_1.TokenKind.BooleanLiteral:
                return 'atom';
            case query_language_1.TokenKind.StringLiteral:
                return 'string';
            case query_language_1.TokenKind.Comment:
                return 'comment';
            case query_language_1.TokenKind.OpenBrace:
                return '{';
            case query_language_1.TokenKind.CloseBrace:
                return '}';
            case query_language_1.TokenKind.OpenParen:
                return '(';
            case query_language_1.TokenKind.CloseParen:
                return ')';
            case query_language_1.TokenKind.OpenBracket:
                return '[';
            case query_language_1.TokenKind.CloseBracket:
                return ']';
            case query_language_1.TokenKind.Comma:
                return ',';
            case query_language_1.TokenKind.Pipe:
                return '|';
            case query_language_1.TokenKind.AddOperator:
            case query_language_1.TokenKind.SubtractOperator:
            case query_language_1.TokenKind.MultiplyOperator:
            case query_language_1.TokenKind.DivideOperator:
            case query_language_1.TokenKind.ModuloOperator:
            case query_language_1.TokenKind.PowerOperator:
            case query_language_1.TokenKind.LessThan:
            case query_language_1.TokenKind.LessEqual:
            case query_language_1.TokenKind.GreaterThan:
            case query_language_1.TokenKind.GreaterEqual:
            case query_language_1.TokenKind.Equal:
            case query_language_1.TokenKind.NotEqual:
            case query_language_1.TokenKind.InOperator:
            case query_language_1.TokenKind.RangeOperator:
            case query_language_1.TokenKind.ComposeOperator:
            case query_language_1.TokenKind.Colon:
            case query_language_1.TokenKind.FatArrow:
                return 'operator';
            case query_language_1.TokenKind.WhiteSpace:
                return null;
            default:
                utils_1.assertNever(kind);
        }
    }
}
exports.default = Highlighter;
//# sourceMappingURL=highlighter.js.map