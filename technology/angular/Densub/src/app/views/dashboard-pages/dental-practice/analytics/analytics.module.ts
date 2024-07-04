import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsComponent } from './analytics.component';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { HighchartsChartModule } from 'highcharts-angular';


@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    FormsModule,
    SharedUiModule,
    NgxPaginationModule,
    OrderModule,
    BsDatepickerModule.forRoot(),
    HighchartsChartModule
  ]
})
export class AnalyticsModule { }
