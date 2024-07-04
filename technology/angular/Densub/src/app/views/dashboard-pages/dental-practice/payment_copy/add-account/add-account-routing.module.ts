import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddAccountComponent } from './add-account.component';


const routes: Routes = [
  { path: "", component: AddAccountComponent, data: { title: 'Add Account' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddAccountRoutingModule { }
