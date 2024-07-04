import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeRoutingModule } from './employee-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { TemplatesComponent } from './templates/templates.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material/material.module';
import { LibraryComponent } from './library/library.component';
import { DeleteDialogComponent } from '../shared/delete-dialog/delete-dialog.component';
import { StepperComponent } from './stepper/stepper.component';
import { BasicComponent } from './stepper/basic/basic.component';
import { ComponentComponent } from './stepper/component/component.component';
import { AddNewComponent } from './stepper/component/add-new/add-new.component';
import { VerifyTemplateComponent } from './verify-template/verify-template.component';
import { DownloadInvoiceComponent } from './download-invoice/download-invoice.component';
import { GenerateInvoiceComponent } from './stepper/generate-invoice/generate-invoice.component';
import { LogoutDialogComponent } from '../shared/logout-dialog/logout-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserFeedbackComponent } from './user-feedback/user-feedback.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { DashboardItemsComponent } from './dashboard/dashboard-items/dashboard-items.component';
import { ViewTemplateComponent } from './view-template/view-template.component';
import { GlobalTemplatesComponent } from './global-templates/global-templates.component';
import { AddGlobalTemplateComponent } from './global-templates/add-global-template/add-global-template.component';
import { GeneratedDocumentsComponent } from './generated-documents/generated-documents.component';
import { ViewDocumentComponent } from './generated-documents/view-document/view-document.component';
import { MatSelectInfiniteScrollDirective } from '../directives/mat-select-infinite-scroll.directive';

@NgModule({
  declarations: [
    DashboardComponent,
    TemplatesComponent,
    LibraryComponent,
    StepperComponent,
    BasicComponent,
    ComponentComponent,
    AddNewComponent,
    VerifyTemplateComponent,
    DownloadInvoiceComponent,
    GenerateInvoiceComponent,
    UserFeedbackComponent,
    DashboardItemsComponent,
    ViewTemplateComponent,
    GlobalTemplatesComponent,
    AddGlobalTemplateComponent,
    GeneratedDocumentsComponent,
    ViewDocumentComponent,
    MatSelectInfiniteScrollDirective
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    CarouselModule
  ],
  entryComponents: [
    DeleteDialogComponent,
    LogoutDialogComponent,
    LibraryComponent,
  ],
  providers: [
    { provide: MatDialogRef, useValue: {} },
	{ provide: MAT_DIALOG_DATA, useValue: [] },
  ],
})
export class EmployeeModule {}
