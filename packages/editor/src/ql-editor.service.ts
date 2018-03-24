import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Editor } from 'codemirror';

@Injectable()
export class QLEditorService {

  readonly onChanges$ = new Subject<Editor>();

  readonly onCursorActivity$ = new Subject<Editor>();

  readonly onKeyup$ = new Subject<{ editor: Editor, event: KeyboardEvent }>();

  readonly onHintsShown$ = new Subject();

  readonly onHintsClosed$ = new Subject();

  // readonly onKeyHandled$ = new Subject<{ editor: Editor, name: string, event: Event}>();

  readonly code$ = this.onChanges$.map(editor => editor.getValue());


  // readonly cursorPosition$ = new Subject<Position>();
  //
  // readonly cursorCoords$ = new Subject<{ top: number, bottom: number, left: number }>();


  // public editor: Editor | null = null;


  // setEditor(editor: Editor) {
  //   this.editor = editor;
  // }

  // init(textarea: HTMLTextAreaElement, readonly: boolean = false, theme: string = 'default') {
  //   this.editor = this.createEditor(textarea, readonly, theme);
  // }
  //
  // protected createEditor(textarea: HTMLTextAreaElement, readOnly: boolean, theme: string): Editor {
  //   const editor = fromTextArea(textarea, {
  //     theme,
  //     mode: 'QL',
  //     lint: this.lintOptions(),
  //   });
  //
  //   if (!readOnly) {
  //     editor.on('changes', bind(this.onEditorChanges, this));
  //     this.onEditorChanges(editor);
  //
  //     editor.on('changes', bind(this.onKeypress, this));
  //   }
  //
  //   return editor;
  // }
  //
  // protected registerListeners(editor: Editor) {
  //   editor.on('changes')
  // }
  //
  // protected onEditorChanges(instance: Editor) {
  //   this.compiler.code$.next(instance.getValue());
  // }
  //
  // protected onKeypress(editor: Editor) {
  //   this.hinter.showHintMenu(editor);
  // }
  //
  // protected lintOptions() {
  //   if (!this.readOnly) {
  //     return {
  //       async: false,
  //       hasGutters: true,
  //       getAnnotations: bind(this.linter.lint, this.linter),
  //     };
  //   }
  //   return false;
  // }
}
