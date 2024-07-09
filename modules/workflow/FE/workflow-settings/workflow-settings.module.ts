import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowSettingsRoutingModule } from './workflow-settings-routing.module';
import { WorkflowSettingsComponent } from './workflow-settings/workflow-settings.component';
import { SharedModule } from 'app/shared/shared.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { WorkflowEnrollWarningModalComponent } from './workflow-enroll-warning-modal/workflow-enroll-warning-modal.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';


@NgModule({
  declarations: [
    WorkflowSettingsComponent,
    WorkflowEnrollWarningModalComponent
  ],
  imports: [
    CommonModule,
    WorkflowSettingsRoutingModule,
    SharedModule,
    SharedMaterialModule,
    PageLayoutModule,
    BreadcrumbsModule,
    NgOtpInputModule,
    MatSelectInfiniteScrollModule
  ]
})
export class WorkflowSettingsModule { }
