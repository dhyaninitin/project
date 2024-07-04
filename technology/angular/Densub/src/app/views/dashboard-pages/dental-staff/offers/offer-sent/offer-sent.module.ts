import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferSentRoutingModule } from './offer-sent-routing.module';
import { OfferSentComponent } from './offer-sent.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgxCarouselModule } from 'ngx-carousel';



@NgModule({
  declarations: [OfferSentComponent],
  imports: [
    CommonModule,
    OfferSentRoutingModule,
    NgxPaginationModule,
    OrderModule,
    SharedUiModule,
    ModalModule.forRoot(),
    FormsModule,
    NgxEditorModule,
    DpDatePickerModule,
    CKEditorModule,
    NgxCarouselModule
  ]
})
export class OfferSentModule { }
