import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobDraftsComponent } from './job-drafts.component';


const routes: Routes = [
  {path: "", component:JobDraftsComponent, data:{title:'Profile'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobDraftsRoutingModule { }
