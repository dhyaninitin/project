import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PositionTypeRoutingModule } from './position-type-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { PositionTypeComponent } from './position-type.component';


@NgModule({
  declarations: [PositionTypeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    PositionTypeRoutingModule,
    OrderModule,
  ]
})
export class PositionTypeModule { }
