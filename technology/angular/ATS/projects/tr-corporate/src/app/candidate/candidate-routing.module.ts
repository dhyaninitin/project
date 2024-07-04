import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddCandidateComponent } from './add-candidate/add-candidate.component';
import { CandidateComponent } from './candidate.component';

const routes: Routes = [
  {
    path:'',
    component: CandidateComponent,
    children:[
      {
        path: 'add-candidate',
        component: AddCandidateComponent
      },
      {
        path:'',
        pathMatch:'full',
        redirectTo: 'add-candidate'
      },
      {
        path:'**',
        redirectTo:'add-candidate'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CandidatedRoutingModule { }
