import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryRoutingModule } from './country-routing.module';
import { CountryComponent } from './country.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [CountryComponent],
  imports: [
    CommonModule,
    CountryRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule
  ]
})
export class CountryModule { }
