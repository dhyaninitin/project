import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffViewProfileComponent } from './staff-view-profile.component';


const routes: Routes = [
  { path: '', component: StaffViewProfileComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffViewProfileRoutingModule { }
