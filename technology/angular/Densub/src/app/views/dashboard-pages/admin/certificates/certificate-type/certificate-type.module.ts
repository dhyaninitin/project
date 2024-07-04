import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CertificateTypeRoutingModule } from './certificate-type-routing.module';
import { CertificateTypeComponent } from './certificate-type.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  declarations: [CertificateTypeComponent],
  imports: [
    CommonModule,
    CertificateTypeRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule
  ]
})
export class CertificateTypeModule { }
