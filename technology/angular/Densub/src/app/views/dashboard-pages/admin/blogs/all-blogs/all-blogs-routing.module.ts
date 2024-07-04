import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllBlogsComponent } from './all-blogs.component';


const routes: Routes = [
  { path: '', component: AllBlogsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllBlogsRoutingModule { }
