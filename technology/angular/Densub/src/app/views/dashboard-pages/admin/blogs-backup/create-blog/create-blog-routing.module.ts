import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateBlogComponent } from './create-blog.component';


const routes: Routes = [
  { path: '', component: CreateBlogComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateBlogRoutingModule { }
