import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CategoriesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CategoriesRoutingModule,
    NgxPaginationModule,
    OrderModule,
    ModalModule.forRoot(),
  ]
})
export class CategoriesModule { 
  constructor( ) { }
}
