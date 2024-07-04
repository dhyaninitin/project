import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersPracticeRoutingModule } from './users-practice-routing.module';
import { UsersPracticeComponent } from './users-practice.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';


@NgModule({
  declarations: [UsersPracticeComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
    UsersPracticeRoutingModule
  ]
})
export class UsersPracticeModule { }
