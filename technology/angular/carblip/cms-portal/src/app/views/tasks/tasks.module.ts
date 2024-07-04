import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksComponent } from './tasks.component';
import { TableComponent } from './table/table.component';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { SharedModule } from 'app/shared/shared.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { TasksRoutes } from './tasks.routing';
import { RouterModule } from '@angular/router';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';


@NgModule({
  declarations: [
    TasksComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    SharedMaterialModule,
    SharedModule,
    PageLayoutModule,
    BreadcrumbsModule,
    RouterModule.forChild(TasksRoutes),
    MatSelectInfiniteScrollModule
  ]
})
export class TasksModule { }
