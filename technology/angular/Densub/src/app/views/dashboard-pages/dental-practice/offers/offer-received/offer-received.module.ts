import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferReceivedRoutingModule } from './offer-received-routing.module';
import { OfferReceivedComponent } from './offer-received.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { DpDatePickerModule } from 'ng2-date-picker';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';


@NgModule({
  declarations: [OfferReceivedComponent],
  imports: [
    NgxPaginationModule,
    OrderModule,
    CommonModule,
    FormsModule,
    OfferReceivedRoutingModule,
    SharedUiModule,
    DpDatePickerModule,
  ]
})
export class OfferReceivedModule { }


