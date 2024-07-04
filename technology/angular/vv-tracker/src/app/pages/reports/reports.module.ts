import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { PageLayoutModule } from "../../../@vex/components/page-layout/page-layout.module";
import { ChartModule } from 'src/@vex/components/chart/chart.module';
import {MatCardModule} from '@angular/material/card';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../shared/material/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        ReportsComponent
    ],
    imports: [
        CommonModule,
        ReportsRoutingModule,
        PageLayoutModule,
        ChartModule,
        MatCardModule,
        SharedModule,
        MaterialModule,
        FormsModule
    ]
})
export class ReportsModule { }
