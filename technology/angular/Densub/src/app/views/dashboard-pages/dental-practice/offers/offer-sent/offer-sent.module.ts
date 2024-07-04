import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferSentRoutingModule } from './offer-sent-routing.module';
import { OfferSentComponent } from './offer-sent.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { ModalModule, BsDatepickerModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { DpDatePickerModule } from 'ng2-date-picker';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';


@NgModule({
  declarations: [OfferSentComponent],
  imports: [
    CommonModule,
    SharedUiModule,
    OfferSentRoutingModule,
    NgxPaginationModule,
    OrderModule,
    FormsModule,
    ModalModule.forRoot(),
    DpDatePickerModule,
  ]
})
export class OfferSentModule { }
