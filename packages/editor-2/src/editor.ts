import { fromTextArea, Editor as CMEditor } from 'codemirror';
import { Observable } from 'rxjs';
import { MODE_NAME, initializeMode } from './mode';
import 'codemirror/mode/htmlmixed/htmlmixed';

export interface EditorSettings {
  readOnly?: boolean;
  theme?: string;
  code?: string;
}

export default class Editor {
  public editor: CMEditor;
  // public changes$: Observable<>;

  constructor(
    private readonly element: HTMLTextAreaElement,
    private readonly settings: EditorSettings = {},
  ) {
    initializeMode();
    this.editor = this.createEditor();
  }

  private createEditor(): CMEditor {
    const editor = fromTextArea(this.element, {
      mode: MODE_NAME,
      theme: this.settings.theme || 'monokai',
      // lineNumbers: true, // TODO this doesn't work for some reason
      inputStyle: 'contenteditable',
      readOnly: this.settings.readOnly ? 'nocursor' : false,
      value: this.settings.code || '',
      // lint: this.lintOptions(), // TODO
    });

    this.registerListeners(editor);

    return editor;
  }

  private registerListeners(editor: CMEditor) {
    // editor.on('changes')
  }
}
