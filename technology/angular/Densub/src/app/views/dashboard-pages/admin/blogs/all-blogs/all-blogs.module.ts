import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllBlogsRoutingModule } from './all-blogs-routing.module';
import { AllBlogsComponent } from './all-blogs.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [AllBlogsComponent],
  imports: [
    CommonModule,
    AllBlogsRoutingModule,
    NgxPaginationModule,
    OrderModule,
    ModalModule.forRoot(),
  ]
})
export class AllBlogsModule { }
