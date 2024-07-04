import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersAdminComponent } from './users-admin.component';


const routes: Routes = [
  {path: "", component:UsersAdminComponent, data: {title:'Admin'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersAdminRoutingModule { }
