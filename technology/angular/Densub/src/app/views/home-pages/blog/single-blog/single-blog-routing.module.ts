import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingleBlogComponent } from './single-blog.component';


const routes: Routes = [
  { path: '', component: SingleBlogComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleBlogRoutingModule { }
