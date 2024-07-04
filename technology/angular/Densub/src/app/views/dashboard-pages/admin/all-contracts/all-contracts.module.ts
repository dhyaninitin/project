import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllContractsRoutingModule } from './all-contracts-routing.module';
import { ContractDetailsComponent } from './contract-details/contract-details.component';
import { ContractListComponent } from './contract-list/contract-list.component';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
// import { NgxEditorModule } from 'ngx-editor';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { DpDatePickerModule } from 'ng2-date-picker';
// import { StripeModule } from 'stripe-angular';


@NgModule({
  declarations: [ContractListComponent, ContractDetailsComponent],
  imports: [
    CommonModule,
    AllContractsRoutingModule,
    FormsModule,
    // ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    // NgxEditorModule,
    NgxPaginationModule,
    OrderModule,
     DpDatePickerModule,
    // StripeModule.forRoot('pk_test_sUI2ugjB83xUQ9eh5U25Y9P800zuQUHzUh')
  ]
})
export class AllContractsModule { }
