"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codemirror_1 = require("codemirror");
const mode_1 = require("./mode");
class Editor {
    // public changes$: Observable<>;
    constructor(element, settings = {}) {
        this.element = element;
        this.settings = settings;
        mode_1.initializeMode();
        this.editor = this.createEditor();
    }
    createEditor() {
        const editor = codemirror_1.fromTextArea(this.element, {
            mode: mode_1.MODE_NAME,
            theme: this.settings.theme || 'default',
        });
        // Update all computed values on the editor
        editor.setValue(this.settings.code || '');
        editor.setOption('readOnly', this.settings.readOnly);
        this.registerListeners(editor);
        return editor;
    }
    registerListeners(editor) {
        // editor.on('changes')
    }
}
exports.default = Editor;
//# sourceMappingURL=editor.js.map