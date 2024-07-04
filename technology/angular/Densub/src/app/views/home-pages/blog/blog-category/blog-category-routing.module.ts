import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlogCategoryComponent } from './blog-category.component';


const routes: Routes = [
  { path: '', component: BlogCategoryComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogCategoryRoutingModule { }
