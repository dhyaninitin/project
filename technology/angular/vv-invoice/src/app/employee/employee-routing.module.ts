import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardItemsComponent } from './dashboard/dashboard-items/dashboard-items.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddGlobalTemplateComponent } from './global-templates/add-global-template/add-global-template.component';
import { GlobalTemplatesComponent } from './global-templates/global-templates.component';
import { LibraryComponent } from './library/library.component';
import { StepperComponent } from './stepper/stepper.component';
import { TemplatesComponent } from './templates/templates.component';
import { VerifyTemplateComponent } from './verify-template/verify-template.component';
import { GeneratedDocumentsComponent } from './generated-documents/generated-documents.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardItemsComponent },
      { path: 'my-templates', component: TemplatesComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'generate-document', component: VerifyTemplateComponent },
      { path: 'add-template', component: StepperComponent },
      { path: 'global-templates', component: GlobalTemplatesComponent },
      { path: 'add-global-template', component: AddGlobalTemplateComponent },
      { path: 'generated-documents', component: GeneratedDocumentsComponent }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeRoutingModule {}
