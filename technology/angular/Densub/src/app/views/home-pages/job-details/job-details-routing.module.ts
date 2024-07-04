import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobDetailsComponent } from './job-details.component';


const routes: Routes = [
  { path: '', component: JobDetailsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobDetailsRoutingModule { }
