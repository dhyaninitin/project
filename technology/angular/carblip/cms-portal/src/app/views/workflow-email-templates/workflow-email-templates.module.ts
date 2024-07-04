import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { EmailTemplateRoutes } from './workflow-email-template.routing';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { WorkflowEmailtemplatesComponent } from './workflow-email-templates.component';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { EmailTemplateTableComponent } from './email-template-table/email-template-table.component';
import { EmailTemplateModalComponent } from './email-template-modal/email-template-modal.component';
import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [WorkflowEmailtemplatesComponent, EmailTemplateTableComponent, EmailTemplateModalComponent],
  imports: [
    CommonModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(EmailTemplateRoutes),
    PageLayoutModule,
    BreadcrumbsModule,
    QuillModule.forRoot(),
  ],
  providers: [
    WorkflowService
  ],
  entryComponents:[EmailTemplateModalComponent, EmailTemplateTableComponent],
})
export class WorkflowEmailTemplatesModule { }
