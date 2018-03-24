import {
  Annotation, Editor, LintStateOptions,
} from 'codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import { Message } from 'query-language';
import { map } from 'lodash';
import { Injectable } from '@angular/core';
import { QLCompilerService } from './ql-compiler.service';





@Injectable()
export class QLLinterService {
  protected messages: Message[] = [];

  constructor(
    protected compiler: QLCompilerService,
  ) {
    this.compiler.messages$.subscribe(messages => this.messages = messages);
  }

  // Called by code mirror automatically based on the linter settings defined
  // in the editor component.
  lint(code: string, options: LintStateOptions, editor: Editor): Annotation[] {
    return this.convertToAnnotations(this.messages);
  }

  protected convertToAnnotations(messages: Message[]): Annotation[] {
    return map(messages, message => ({
      message: message.text,
      severity: message.level,
      from: { line: 0, ch: 0 },
      to: { line: 0, ch: 1 },
    }));
  }
}
