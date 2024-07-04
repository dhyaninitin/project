import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersAdminRoutingModule } from './users-admin-routing.module';
import { UsersAdminComponent } from './users-admin.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';


@NgModule({
  declarations: [UsersAdminComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
    UsersAdminRoutingModule
  ]
})
export class UsersAdminModule { }
