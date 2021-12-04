import { Editor as CMEditor } from 'codemirror';
export interface EditorSettings {
    readOnly?: boolean;
    theme?: string;
    code?: string;
}
export default class Editor {
    private readonly element;
    private readonly settings;
    editor: CMEditor;
    constructor(element: HTMLTextAreaElement, settings?: EditorSettings);
    private createEditor;
    private registerListeners;
}
//# sourceMappingURL=editor.d.ts.map