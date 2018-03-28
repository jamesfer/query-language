import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { QLEditorComponent } from 'query-language-editor';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'ql-demo',
  templateUrl: './ql-demo.component.html',
})
export class QLDemoComponent implements AfterViewInit {
  resultString$: Observable<string>;

  codePrompt = '-- Try typing some code below\n';
  resultPrompt = '-- The result will appear here';

  @ViewChild(QLEditorComponent)
  protected editor: QLEditorComponent;

  ngAfterViewInit() {
    setImmediate(() => {
      this.resultString$ = this.editor.compilerService.result$
        .map(result => (
          result !== null && typeof result !== 'function' ? JSON.stringify(result) : ''
        ))
        .startWith(this.resultPrompt);
    });
  }
}
