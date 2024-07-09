import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WorkflowRoutes } from './workflows.routing';
import { WorkflowsComponent } from './workflows.component';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { SharedModule } from 'app/shared/shared.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { WorkflowsTableComponent } from './table/table.component';
import { WorkflowDetailComponent } from './detail/detail.component';
import { NgxPanZoomModule } from 'ngx-panzoom';
import { ActionModalComponent } from './create/action-modal/action-modal.component';
import { TriggerModalComponent } from './create/trigger-modal/trigger-modal.component';
import { DelayActionComponent } from './create/action-master/delay-action/delay-action.component';
import { EmailActionComponent } from './create/action-master/email-action/email-action.component';
import { BranchActionComponent } from './create/action-master/branch-action/branch-action.component';
import { SmsActionComponent } from './create/action-master/sms-action/sms-action.component';
import { TriggerMasterComponent } from './create/trigger-master/trigger-master.component';
import { CreateComponent } from './create/create.component';
import { WorkflowStatusConfirmationModalComponent } from './workflow-status-confirmation-modal/workflow-status-confirmation-modal.component';
import { WorkflowSettingModalComponent } from './workflow-setting-modal/workflow-setting-modal.component';
import { EnrollmentTriggerActionComponent } from './create/action-master/enrollment-trigger-action/enrollment-trigger-action.component';
import { PropertyActionComponent } from './create/action-master/property-action/property-action.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { EnrollmentHistoryComponent } from './enrollment-history/enrollment-history.component';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { SendDirectEmailComponent } from './create/action-master/send-direct-email/send-direct-email.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { CreateDealActionComponent } from './create/action-master/create-deal-action/create-deal-action.component';
import { VBrandService } from 'app/shared/services/apis/vbrand.service';
import { VModelService } from 'app/shared/services/apis/vmodel.service';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';
import { CloneCopyActionComponent } from './create/clone-copy-action/clone-copy-action.component';
import { ViewEnrollmentsComponent } from './view-enrollments/view-enrollments.component';
import { WebhookActionComponent } from './create/action-master/webhook-action/webhook-action.component';
@NgModule({
  declarations: [
    WorkflowsComponent,
    WorkflowsTableComponent,
    WorkflowDetailComponent, 
    CreateComponent, 
    ActionModalComponent, 
    TriggerModalComponent, 
    DelayActionComponent, 
    BranchActionComponent,
    EmailActionComponent, 
    SmsActionComponent, 
    TriggerMasterComponent,
    WorkflowStatusConfirmationModalComponent,
    WorkflowSettingModalComponent,
    EnrollmentTriggerActionComponent,
    PropertyActionComponent,
    EnrollmentHistoryComponent,
    SendDirectEmailComponent,
    CreateDealActionComponent,
    CloneCopyActionComponent,
    ViewEnrollmentsComponent,
    WebhookActionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedMaterialModule,
    RouterModule.forChild(WorkflowRoutes),
    PageLayoutModule,
    BreadcrumbsModule,
    NgxPanZoomModule,
    DragDropModule,
    MatSelectInfiniteScrollModule,
    NgOtpInputModule
  ],
  entryComponents: [
    ActionModalComponent, 
    TriggerModalComponent, 
    DelayActionComponent, 
    EmailActionComponent, 
    BranchActionComponent,
    SmsActionComponent,
    TriggerMasterComponent,
    CloneCopyActionComponent
  ],
  providers: [
    VBrandService,
    VModelService,
    VehicleService,
    DealStageService,
  ],
})
export class WorkflowModule { }
