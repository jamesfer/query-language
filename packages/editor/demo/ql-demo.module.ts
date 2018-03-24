import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { QLEditorModule } from '../src/ql-editor.module';

import { QLDemoComponent } from './ql-demo.component';
import { CommonModule } from '@angular/common';


@NgModule({
  bootstrap: [
    QLDemoComponent,
  ],
  imports: [
    BrowserModule,
    QLEditorModule,
    CommonModule,
  ],
  declarations: [
    QLDemoComponent,
  ],
})
export class QLDemoModule {}
