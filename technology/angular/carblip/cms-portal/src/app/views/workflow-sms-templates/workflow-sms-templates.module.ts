import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { SmsTemplateRoutes } from './workflow-sms-template.routing';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { WorkflowSmstemplatesComponent } from './workflow-sms-templates.component';
import { SmstemplateModalComponent } from './sms-template-modal/sms-template-modal.component';
import { SmstemplateTableComponent } from './sms-template-table/sms-template-table.component';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';

@NgModule({
  declarations: [WorkflowSmstemplatesComponent, SmstemplateModalComponent, SmstemplateTableComponent],
  imports: [
    CommonModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(SmsTemplateRoutes),
    PageLayoutModule,
    BreadcrumbsModule,
  ],
  providers: [
    WorkflowService
  ],
  entryComponents:[SmstemplateModalComponent,SmstemplateTableComponent],
})
export class WorkflowSmsTemplatesModule { }
