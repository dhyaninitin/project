import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersPracticeComponent } from './users-practice.component';


const routes: Routes = [
  {path: "", component:UsersPracticeComponent, data: {title:'Practice'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersPracticeRoutingModule { }
