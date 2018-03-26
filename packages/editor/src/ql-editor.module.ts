import { NgModule } from '@angular/core';
import { QLEditorComponent } from './ql-editor.component';
import { CommonModule } from '@angular/common';

import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/publish';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';

export {
  QLEditorComponent,
};


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    QLEditorComponent,
  ],
  exports: [
    QLEditorComponent,
  ],
})
export class QLEditorModule {}
