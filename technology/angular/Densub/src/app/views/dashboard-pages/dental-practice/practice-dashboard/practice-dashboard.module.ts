import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { PracticeDashboardComponent } from './practice-dashboard.component';
import { PracticeDashboardRoutingModule } from './practice-dashboard-routing.module';
import { DateAdapter, CalendarModule } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { StripeModule } from 'stripe-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    PracticeDashboardRoutingModule,
    NgxPaginationModule,
    OrderModule,
    StripeModule.forRoot('pk_test_sUI2ugjB83xUQ9eh5U25Y9P800zuQUHzUh'),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  declarations: [PracticeDashboardComponent],
  providers: []
})

export class PracticeDashboardModule { }
