import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LicenseTypeRoutingModule } from './license-type-routing.module';
import { LicenseTypeComponent } from './license-type.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  declarations: [LicenseTypeComponent],
  imports: [
    CommonModule,
    LicenseTypeRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule
  ]
})
export class LicenseTypeModule { }
