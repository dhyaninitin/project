import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CertificatesRoutingModule } from './certificates-routing.module';
import { CertificatesComponent } from './certificates.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  declarations: [CertificatesComponent],
  imports: [
    CommonModule,
    CertificatesRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule
  ]
})
export class CertificatesModule { }
