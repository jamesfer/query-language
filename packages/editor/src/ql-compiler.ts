import { Message, ExecutionResult } from 'query-language';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { execute } from 'query-language';


export class QLCompiler {
  /** Input for code from CodeMirror */
  readonly code$ = new Subject<string>();

  readonly evaluationResult$: Observable<ExecutionResult | null> = this.code$
    .debounceTime(250)
    .map(code => {
      return this.compile(code)
        .catch(err => {
          console.error(err);
          return null;
        });
    })
    .concatMap(promiseResult => Observable.fromPromise(promiseResult))
    .publish()
    .refCount();

  readonly messages$: Observable<Message[]> = this.evaluationResult$.map(result => {
    if (result) {
      return result.messages;
    }
    return [];
  });

  readonly result$: Observable<any> = this.evaluationResult$.concatMap(result => {
    if (result && result.result) {
      return result.result;
    }
    return Observable.of(null);
  });


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
