import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkDiaryRoutingModule } from './work-diary-routing.module';
import { WorkDiaryComponent } from './work-diary.component';
import { PageLayoutModule } from 'src/@vex/components/page-layout/page-layout.module';
import { MaterialModule } from '../shared/material/shared.module';
import { DailyDiaryComponent } from './daily-diary/daily-diary.component';
import { SharedModule } from '../shared/shared.module';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ScreenshotDetailsComponent } from './screenshot-details/screenshot-details.component';
import { ViewFullScreenshotComponent } from './screenshot-details/view-full-screenshot/view-full-screenshot.component';

@NgModule({
  declarations: [
    WorkDiaryComponent,
    DailyDiaryComponent,
    ScreenshotDetailsComponent,
    ViewFullScreenshotComponent
  ],
  imports: [
    CommonModule,
    WorkDiaryRoutingModule,
    PageLayoutModule,
    MaterialModule,
    SharedModule,
    InfiniteScrollModule
  ]
})
export class WorkDiaryModule { }
