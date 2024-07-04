import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, BsDatepickerModule, TimepickerModule } from 'ngx-bootstrap';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { NgxEditorModule } from 'ngx-editor';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { JobDraftsComponent } from './job-drafts.component';
import { JobDraftsRoutingModule } from './job-drafts-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedUiModule,
    NgxEditorModule,
    PDFExportModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    OrderModule,
    ModalModule.forRoot(),
    JobDraftsRoutingModule,
    NgxPaginationModule,
    NgxBootstrapSliderModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    DpDatePickerModule
  ],
  declarations: [JobDraftsComponent],
  providers: []
})
export class JobDraftsModule { }
