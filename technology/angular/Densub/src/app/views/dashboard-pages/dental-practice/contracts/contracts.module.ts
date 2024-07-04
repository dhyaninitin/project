import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractsRoutingModule } from './contracts-routing.module';
import { ContractListComponent } from './contract-list/contract-list.component';
import { ContractDetailsComponent } from './contract-details/contract-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { StripeModule } from 'stripe-angular';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CKEditorModule } from 'ng2-ckeditor';

@NgModule({
  declarations: [ContractListComponent, ContractDetailsComponent],
  imports: [
    CommonModule,
    ContractsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxEditorModule,
    NgxPaginationModule,
    OrderModule,
    DpDatePickerModule,
    StripeModule.forRoot('pk_test_sUI2ugjB83xUQ9eh5U25Y9P800zuQUHzUh'),
    CKEditorModule
  ],
  exports:[ContractDetailsComponent]
})
export class ContractsModule { }
