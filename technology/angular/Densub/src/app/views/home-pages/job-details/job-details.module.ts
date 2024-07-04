import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { OwlModule } from 'ngx-owl-carousel';
import { JobDetailsRoutingModule } from './job-details-routing.module';
import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OwlModule,
    SharedUiModule,
    NgxEditorModule,
    JobDetailsRoutingModule,
    ModalModule.forRoot(),
  ],
  declarations: [],
  providers: []
})
export class JobDetailsModule { }
