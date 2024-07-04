import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { AssignmentDetailsComponent } from './assignment-details/assignment-details.component';


const routes: Routes = [
  {path: '', component: AssignmentListComponent, data: { title: 'Contract List' } },
  {path: 'details/:contractId', component: AssignmentDetailsComponent, data: { title: 'Contract Details' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyAssignmentRoutingModule { }
