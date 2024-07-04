import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AvailabilityComponent } from './availability.component';


const routes: Routes = [
  {path: '', component: AvailabilityComponent, data: {title: 'Availability'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AvailabilityRoutingModule { }
