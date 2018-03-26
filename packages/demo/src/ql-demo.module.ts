import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { QLEditorModule } from 'query-language-editor';
import { QLDemoComponent } from './ql-demo.component';

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
