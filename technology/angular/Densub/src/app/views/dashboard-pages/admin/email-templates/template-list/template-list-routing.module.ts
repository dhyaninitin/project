import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateListComponent } from './template-list.component';


const routes: Routes = [
  { path: '', component: TemplateListComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateListRoutingModule { }
