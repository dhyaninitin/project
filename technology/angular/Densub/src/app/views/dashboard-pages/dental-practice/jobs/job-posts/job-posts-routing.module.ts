import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobPostsComponent } from './job-posts.component';


const routes: Routes = [
  {path: '', component: JobPostsComponent, data: {title: 'Profile'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobPostsRoutingModule { }
