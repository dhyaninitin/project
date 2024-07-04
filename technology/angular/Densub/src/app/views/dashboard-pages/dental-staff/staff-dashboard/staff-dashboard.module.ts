import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { StaffDashboardComponent } from './staff-dashboard.component';
import { StaffDashboardRoutingModule } from './staff-dashboard-routing.module';
import { DateAdapter, CalendarModule } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    StaffDashboardRoutingModule,
    ModalModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    NgxPaginationModule,
  ],
  declarations: [StaffDashboardComponent],
  providers: []
})
export class StaffDashboardModule { }
