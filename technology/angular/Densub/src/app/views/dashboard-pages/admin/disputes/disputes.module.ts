import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DisputesRoutingModule } from './disputes-routing.module';
import { DisputesComponent } from './disputes.component';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  declarations: [DisputesComponent],
  imports: [
    CommonModule,
    DisputesRoutingModule,
    FormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
  ]
})
export class DisputesModule { }
