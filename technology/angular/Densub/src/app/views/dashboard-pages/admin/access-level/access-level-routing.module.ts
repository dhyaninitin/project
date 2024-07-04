import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessLevelComponent } from './access-level.component';


const routes: Routes = [
  {path: "", component:AccessLevelComponent, data: {title: 'Access Level'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessLevelRoutingModule { }
