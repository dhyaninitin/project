import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OfferDetailsRoutingModule } from './offer-details-routing.module';
import { OfferDetailsComponent } from './offer-details.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { ModalModule , TimepickerModule} from 'ngx-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { CKEditorModule } from 'ng2-ckeditor';

@NgModule({
  declarations: [OfferDetailsComponent],
  imports: [
    SharedUiModule,
    CommonModule,
    OfferDetailsRoutingModule,
    NgxPaginationModule,
    OrderModule,
    ModalModule.forRoot(),
    FormsModule,
    NgxEditorModule,
    TimepickerModule.forRoot(),
    CKEditorModule
  ]
})
export class OfferDetailsModule { }
