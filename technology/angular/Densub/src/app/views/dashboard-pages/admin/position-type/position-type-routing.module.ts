import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PositionTypeComponent } from './position-type.component';


const routes: Routes = [
  {path: '', component:PositionTypeComponent, data: {title: 'Position Type'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionTypeRoutingModule { }
