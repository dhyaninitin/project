import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PracticeDashboardComponent } from './practice-dashboard.component';


const routes: Routes = [
  {path: "", component:PracticeDashboardComponent, data:{title:'Dashboard'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PracticeDashboardRoutingModule { }
