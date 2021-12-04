"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codemirror_1 = require("codemirror");
const highlighter_1 = require("./highlighter");
exports.MODE_NAME = 'query-language';
let modeInitialized = false;
function initializeMode() {
    if (!modeInitialized) {
        codemirror_1.defineMode(exports.MODE_NAME, (config, options) => (new highlighter_1.default(config, options)));
        modeInitialized = true;
    }
}
exports.initializeMode = initializeMode;
//# sourceMappingURL=mode.js.map