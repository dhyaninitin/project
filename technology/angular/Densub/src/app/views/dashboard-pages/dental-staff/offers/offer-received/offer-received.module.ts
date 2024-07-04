import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferReceivedRoutingModule } from './offer-received-routing.module';
import { OfferReceivedComponent } from './offer-received.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { ModalModule, TimepickerModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgxCarouselModule } from 'ngx-carousel';

@NgModule({
  declarations: [OfferReceivedComponent],
  imports: [
    CommonModule,
    OfferReceivedRoutingModule,
    NgxPaginationModule,
    OrderModule,
    ModalModule.forRoot(),
    FormsModule,
    SharedUiModule,
    NgxEditorModule,
    DpDatePickerModule,
    CKEditorModule,
    TimepickerModule,
    NgxCarouselModule
  ]
})
export class OfferReceivedModule { }
