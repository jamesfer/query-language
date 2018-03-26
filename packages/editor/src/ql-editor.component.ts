import {
  AfterViewInit, Component, ElementRef, Input,
  ViewChild, ViewEncapsulation, OnDestroy,
} from '@angular/core';
import { defineMode, Editor, fromTextArea } from 'codemirror';
import { defer, bind, isString } from 'lodash';
import { QLEditorService } from './ql-editor.service';
import { QLCompilerService } from './ql-compiler.service';
import { QLLinterService } from './ql-linter.service';
import { QLHinterService } from './ql-hinter.service';
import { QLHighlighter } from './ql-highlighter';


@Component({
  selector: 'ql-editor',
  templateUrl: './ql-editor.component.html',
  styleUrls: [ './ql-editor.component.scss' ],
  providers: [
    QLEditorService,
    QLCompilerService,
    QLLinterService,
    QLHinterService,
  ],
  // Disable view encapsulation so that styles can be applied to the CodeMirror
  // element
  encapsulation: ViewEncapsulation.None,
})
export class QLEditorComponent implements AfterViewInit, OnDestroy {
  // readonly compiler = new QLCompiler();
  // readonly linter = new QLLinter(this.compiler);
  // readonly hinter = new QLHinter(this.compiler);

  @Input()
  get theme() {
    return this._theme;
  }
  set theme(theme: string) {
    this._theme = theme;
    if (this.editor) {
      this.editor.setOption('theme', this._theme);
    }
  }

  @Input()
  get readOnly() {
    return this._readOnly;
  }
  set readOnly(readOnly: boolean | string) {
    if (isString(readOnly)) {
      readOnly = readOnly === 'true';
    }

    this._readOnly = readOnly;
    if (this.editor) {
      this.editor.setOption('readOnly', this._readOnly);
      this.registerListeners(this.editor);
    }
  }

  @Input()
  get value() {
    return this.editor ? this.editor.getValue() : null;
  }
  set value(code: string | null) {
    this._value = code || '';
    if (this.editor) {
      this.editor.setValue(this._value);
    }
  }

  @ViewChild('editor')
  protected readonly textarea: ElementRef;

  protected editor: Editor | undefined;

  private _theme = 'default';

  private _readOnly = false;

  private _value = '';

  private readonly eventListeners = {
    changes: (editor: Editor) => {
      this.editorService.onChanges$.next(editor);
    },
    cursorActivity: (editor: Editor) => {
      this.editorService.onCursorActivity$.next(editor);
    },
    keyup: (editor: Editor, event: KeyboardEvent) => {
      this.editorService.onKeyup$.next({ editor, event });
    },
    shown: () => {
      this.editorService.onHintsShown$.next();
    },
    close: () => {
      this.editorService.onHintsClosed$.next();
    }
  };

  constructor(
    protected editorService: QLEditorService,
    protected linterService: QLLinterService,
    protected hinterService: QLHinterService,
    // Compiler service is public so that it can be accessed by users
    public compilerService: QLCompilerService,
  ) {
    defineMode('QL', (config, options) => new QLHighlighter(config, options));
  }


  ngAfterViewInit() {
    defer(() => {
      this.editor = this.createEditor();
      // this.editorService.editor = this.editor;
    }, 0);
  }

  ngOnDestroy() {
    // Clean up all editor subscriptions subscriptions
    this.editorService.onChanges$.complete();
    this.editorService.onCursorActivity$.complete();
  }

  protected createEditor(): Editor {
    const editor = fromTextArea(this.textarea.nativeElement, {
      mode: 'QL',
      theme: this.theme || 'default',
      lint: this.lintOptions(),
    });

    // Update all computed values on the editor
    editor.setValue(this._value);
    editor.setOption('readOnly', this._readOnly);
    editor.setOption('theme', this._theme);

    this.registerListeners(editor);
    return editor;
  }

  // protected readonly onChangesListener = (editor: Editor) => {
  //   this.editorService.onChanges$.next(editor);
  // };
  //
  // protected readonly onCursorActivityListener = (editor: Editor) => {
  //   this.editorService.onCursorActivity$.next(editor);
  // };
  //
  // protected readonly onKeyUpListener = (editor: Editor, event: Event) => {
  //   this.editorService.onKeyUp$.next({ editor, event });
  // };

  // protected readonly onKeyHandledListener = (editor: Editor, name: string, event: Event) => {
  //   this.editorService.onKeyHandled$.next({ editor, name, event });
  // };

  protected registerListeners(editor: Editor) {
    if (this.readOnly) {
      // Unbind existing listeners if the editor already exists on the model
      if (this.editor) {
        for (const key in this.eventListeners) {
          if (this.eventListeners.hasOwnProperty(key)) {
            editor.off(key, this.eventListeners[key]);
          }
        }

        // editor.off('changes', this.onChangesListener);
        // editor.off('cursorActivity', this.onCursorActivityListener);
        // editor.off('keyUp', this.onCursorActivityListener);
        // editor.off('keyHandled', this.onKeyHandledListener as (editor: Editor) => any);
      }
    } else {
      for (const key in this.eventListeners) {
        if (this.eventListeners.hasOwnProperty(key)) {
          editor.on(key, this.eventListeners[key]);
        }
      }

      // editor.on('changes', this.onChangesListener);
      // editor.on('cursorActivity', this.onCursorActivityListener);
      // editor.on('keyUp', this.onCursorActivityListener);
      // editor.on('keyHandled', this.onKeyHandledListener as (editor: Editor) => any);
    }
  }

  protected lintOptions() {
    if (!this.readOnly) {
      return {
        async: false,
        hasGutters: true,
        getAnnotations: bind(this.linterService.lint, this.linterService),
      };
    }
    return false;
  }
}
