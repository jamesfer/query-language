import {
  Annotation, Editor, LintStateOptions,
} from 'codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import { Message } from 'query-language';
import { map } from 'lodash';
import { QLCompiler } from './ql-compiler';


function convertToAnnotations(messages: Message[]): Annotation[] {
  return map(messages, message => ({
    message: message.text,
    severity: message.level,
    from: { line: 0, ch: 0 },
    to: { line: 0, ch: 1 },
  }));
}


export class QLLinter {
  constructor(protected compiler: QLCompiler) {}

  getMessages(): Promise<Message[]> {
    return this.compiler.messages$.first().toPromise();
  }

  lint(code: string, options: LintStateOptions, editor: Editor): Promise<Annotation[]> {
    return this.getMessages()
      .then(convertToAnnotations)
      .catch(err => {
        console.error(err);
        return [];
      });
  }
}
