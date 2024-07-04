import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanRouteChangeGuard } from '../../../../shared-ui/guard/can-route-change.guard';
import { StaffProfileComponent } from './staff-profile.component';


const routes: Routes = [
  {path: "", component:StaffProfileComponent, canDeactivate: [CanRouteChangeGuard] ,data:{title:'Profile'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffProfileRoutingModule { }
