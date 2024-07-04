import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentListRoutingModule } from './payment-list-routing.module';
import { PaymentListComponent } from './payment-list.component';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  declarations: [PaymentListComponent],
  imports: [
    CommonModule,
    PaymentListRoutingModule,
    FormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
  ]
})
export class PaymentListModule { }
