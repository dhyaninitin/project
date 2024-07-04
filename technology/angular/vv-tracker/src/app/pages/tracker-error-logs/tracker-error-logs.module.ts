import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrackerErrorLogsRoutingModule } from './tracker-error-logs-routing.module';
import { TrackerErrorLogsComponent } from './tracker-error-logs.component';
import { MaterialModule } from '../shared/material/shared.module';


@NgModule({
  declarations: [
    TrackerErrorLogsComponent
  ],
  imports: [
    CommonModule,
    TrackerErrorLogsRoutingModule,
    MaterialModule
  ]
})
export class TrackerErrorLogsModule { }
