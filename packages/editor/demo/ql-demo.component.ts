import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { QLEditorComponent } from '../src/ql-editor.component';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'ql-demo',
  templateUrl: './ql-demo.component.html',
  styleUrls: [ './ql-demo.component.scss' ],
})
export class QLDemoComponent implements AfterViewInit {
  resultString$: Observable<string>;

  initialContent = `map(sin & tan, [ 0.1, 0.5, 0.9 ])`;

  @ViewChild(QLEditorComponent)
  protected editor: QLEditorComponent;

  ngAfterViewInit() {
    this.resultString$ = this.editor.compilerService.result$.map(result => {
      return JSON.stringify(result);
    });
  }
}
