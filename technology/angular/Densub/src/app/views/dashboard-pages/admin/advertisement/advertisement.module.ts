import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { AdvertisementRoutingModule } from './advertisement-routing.module';
import { AdvertisementComponent } from './advertisement.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    AdvertisementRoutingModule,
    OrderModule,
  ],
  declarations: [AdvertisementComponent],
  providers: []
})
export class AdvertisementModule { }
