import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersStaffComponent } from './users-staff.component';


const routes: Routes = [
  {path: "", component:UsersStaffComponent, data: {title:'Staff'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersStaffRoutingModule { }
