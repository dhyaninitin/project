import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpecialtiesRoutingModule } from './specialties-routing.module';
import { SpecialtiesComponent } from './specialties.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  declarations: [SpecialtiesComponent],
  imports: [
    CommonModule,
    SpecialtiesRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
  ]
})
export class SpecialtiesModule { }
