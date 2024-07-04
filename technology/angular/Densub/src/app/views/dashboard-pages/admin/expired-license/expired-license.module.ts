import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpiredLicenseRoutingModule } from './expired-license-routing.module';
import { ExpiredLicenseComponent } from './expired-license.component';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  declarations: [ExpiredLicenseComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
    ExpiredLicenseRoutingModule
  ]
})
export class ExpiredLicenseModule { }
