import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhoneNumbersComponent } from './phone-numbers.component';

const routes: Routes = [
  {
    path: '**',
    component: PhoneNumbersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhoneNumbersRoutingModule { }
