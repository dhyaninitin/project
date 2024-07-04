import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { UsersRoutingModule } from "./users-routing.module";
import { UsersComponent } from "./users.component";
import { AddUserComponent } from "./add-user/add-user.component";
import { MaterialModule } from "../shared/material/shared.module";
import { PageLayoutModule } from "../../../@vex/components/page-layout/page-layout.module";
import { ViewUserComponent } from "./view-user/view-user.component";
import { DailyComponent } from "./view-user/daily/daily.component";
import { WeeklyComponent } from "./view-user/weekly/weekly.component";
import { MonthlyComponent } from "./view-user/monthly/monthly.component";
import { ViewScreenshotComponent } from './view-user/view-screenshot/view-screenshot.component';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { BreadcrumbsModule } from "../../../@vex/components/breadcrumbs/breadcrumbs.module";
import { ExportModalComponent } from './export-modal/export-modal.component';

@NgModule({
    declarations: [
        UsersComponent,
        AddUserComponent,
        ViewUserComponent,
        DailyComponent,
        WeeklyComponent,
        MonthlyComponent,
        ViewScreenshotComponent,
        ExportModalComponent,
    ],
    providers: [DatePipe],
    imports: [
        CommonModule,
        UsersRoutingModule,
        MaterialModule,
        PageLayoutModule,
        InfiniteScrollModule,
        BreadcrumbsModule
    ]
})
export class UsersModule {}
