import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZipcodeRoutingModule } from './zipcode-routing.module';
import { ZipcodeComponent } from './zipcode.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';


@NgModule({
  declarations: [ZipcodeComponent],
  imports: [
    CommonModule,
    ZipcodeRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
    SharedUiModule
  ]
})
export class ZipcodeModule { }
