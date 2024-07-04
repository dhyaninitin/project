import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule, MaterialModule } from '@tr';
import { QuillModule } from 'ngx-quill';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { TemplatesRoutingModule } from './templates-routing.module';
import { TemplatesComponent } from './templates.component';

import { TemplateViewComponent } from './template-view/template-view.component';

import { PerfectScrollbarModule, PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { McCoreModule } from '@cloudtalentrecruit/ng-core';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

@NgModule({
  declarations: [
    TemplatesComponent,
    TemplateViewComponent,
  ],
  imports: [
    CommonModule,
    McCoreModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    LayoutModule,
    TemplatesRoutingModule,
    PerfectScrollbarModule,
    QuillModule,
    DragDropModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class TemplatesModule { }
