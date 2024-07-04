import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';

import { OfferDetailsRoutingModule } from './offer-details-routing.module';
import { OfferDetailsComponent } from './offer-details.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { ModalModule, TimepickerModule} from 'ngx-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { CKEditorModule } from 'ng2-ckeditor';

@NgModule({
  declarations: [OfferDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    OrderModule,
    NgxEditorModule,
    SharedUiModule,
    OfferDetailsRoutingModule,
    ModalModule.forRoot(),
    TimepickerModule.forRoot(),
    CKEditorModule
  ]
})
export class OfferDetailsModule { }
