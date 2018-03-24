import { Message, ExecutionResult } from 'query-language';
import { Observable } from 'rxjs/Observable';
import { execute } from 'query-language';
import { Injectable } from '@angular/core';
import { QLEditorService } from './ql-editor.service';


@Injectable()
export class QLCompilerService {
  readonly code$ = this.editorService.code$;

  readonly evaluationResult$: Observable<ExecutionResult | null> = this.code$
    .debounceTime(250)
    .switchMap(code => {
      return Observable.fromPromise(this.compile(code)
        .catch(err => {
          console.error(err);
          return null;
        }));
    })
    .publish()
    .refCount();

  readonly messages$: Observable<Message[]> = this.evaluationResult$.map(result => {
    if (result) {
      return result.messages;
    }
    return [];
  });

  readonly result$: Observable<any> = this.evaluationResult$.switchMap(result => {
    if (result && result.result) {
      return result.result;
    }
    return Observable.of(null);
  });


  constructor(protected editorService: QLEditorService) {}


  private compile(code: string): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      let compiled = false;

      // Reject the promise if compilation timed out
      setTimeout(() => {
        if (!compiled) {
          reject(new Error(`Compilation timed out. ${code}`));
        }
      }, 300);

      const result = execute(code);
      compiled = true;
      resolve(result);
    });
  }
}
