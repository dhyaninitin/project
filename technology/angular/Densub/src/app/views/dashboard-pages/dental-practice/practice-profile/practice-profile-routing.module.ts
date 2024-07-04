import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanRouteChangeGuard } from '../../../../shared-ui/guard/can-route-change.guard';
import { PracticeProfileComponent } from './practice-profile.component';


const routes: Routes = [
  {path: '', component: PracticeProfileComponent, canDeactivate:[CanRouteChangeGuard],data: {title: 'Profile'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PracticeProfileRoutingModule { }
