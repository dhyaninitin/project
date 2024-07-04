import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractsModule } from '../../contracts/contracts.module';
import { JobDetailsRoutingModule } from './job-details-routing.module';
import { JobDetailsComponent } from './job-details.component';
import { ModalModule, TimepickerModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { StripeModule } from 'stripe-angular';

@NgModule({
  declarations: [JobDetailsComponent],
  imports: [
    SharedUiModule,
    CommonModule,
    JobDetailsRoutingModule,
    ModalModule.forRoot(),
    FormsModule,
    NgxEditorModule,
    TimepickerModule.forRoot(),
    CKEditorModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgbModule,
    NgbModalModule,
    NgxPaginationModule,
    ContractsModule,
    StripeModule.forRoot('pk_test_sUI2ugjB83xUQ9eh5U25Y9P800zuQUHzUh'),

  ]
})
export class JobDetailsModule { }
