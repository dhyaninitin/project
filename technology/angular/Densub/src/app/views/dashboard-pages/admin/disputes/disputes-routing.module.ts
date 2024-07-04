import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisputesComponent } from './disputes.component';

const routes: Routes = [
  {path: '', component: DisputesComponent, data: {title: 'Diputes'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DisputesRoutingModule { }
