import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromoCodeRoutingModule } from './promo-code-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { PromoCodeComponent } from './promo-code.component';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [PromoCodeComponent],
  imports: [
    CommonModule,
    PromoCodeRoutingModule,
    FormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
    NgxBootstrapSliderModule,
    DpDatePickerModule,
    NgMultiSelectDropDownModule.forRoot(),
  ]
})
export class PromoCodeModule { }
