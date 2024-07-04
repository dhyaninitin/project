import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, BsDatepickerModule, TimepickerModule } from 'ngx-bootstrap';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { NgxEditorModule } from 'ngx-editor';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { JobPostsRoutingModule } from './job-posts-routing.module';
import { JobPostsComponent } from './job-posts.component';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { NgbModule, NgbModalModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FilterPipe } from './filter-by.pipe';
@NgModule({
  imports: [
    CommonModule,
    SharedUiModule,
    NgxEditorModule,
    PDFExportModule,
    NgbModalModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    OrderModule,
    ModalModule.forRoot(),
    JobPostsRoutingModule,
    NgxPaginationModule,
    NgxBootstrapSliderModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    DpDatePickerModule,
    NgbModule,
  ],
  declarations: [JobPostsComponent,FilterPipe],
  providers: [NgbActiveModal]
})
export class JobPostsModule { }
