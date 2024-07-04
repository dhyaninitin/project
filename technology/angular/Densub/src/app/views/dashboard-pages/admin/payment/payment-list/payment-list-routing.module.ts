import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentListComponent } from './payment-list.component';


const routes: Routes = [
  {path: '', component:PaymentListComponent, data: {title: 'Payment List'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentListRoutingModule { }
