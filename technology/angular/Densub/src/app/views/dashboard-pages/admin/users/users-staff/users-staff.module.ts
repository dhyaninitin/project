import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersStaffRoutingModule } from './users-staff-routing.module';
import { UsersStaffComponent } from './users-staff.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';


@NgModule({
  declarations: [UsersStaffComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
    UsersStaffRoutingModule
  ]
})
export class UsersStaffModule { }
