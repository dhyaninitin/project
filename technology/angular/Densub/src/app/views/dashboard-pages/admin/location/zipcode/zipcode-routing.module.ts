import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ZipcodeComponent } from './zipcode.component';


const routes: Routes = [
  { path: '', component: ZipcodeComponent , data: { title: 'Zipcode' }, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ZipcodeRoutingModule { }
