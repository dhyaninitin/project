import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateRoutingModule } from './state-routing.module';
import { StateComponent } from './state.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';

@NgModule({
  declarations: [StateComponent],
  imports: [
    CommonModule,
    StateRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule,
    SharedUiModule
  ]
})
export class StateModule { }
