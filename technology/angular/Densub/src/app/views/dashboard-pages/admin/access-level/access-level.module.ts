import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { AccessLevelComponent } from './access-level.component';
import { AccessLevelRoutingModule } from './access-level-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    AccessLevelRoutingModule,
    OrderModule,
  ],
  declarations: [AccessLevelComponent],
  providers: []
})
export class AccessLevelModule { }
