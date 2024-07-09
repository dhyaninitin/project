import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowSettingsComponent } from './workflow-settings/workflow-settings.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowSettingsComponent
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowSettingsRoutingModule { }
