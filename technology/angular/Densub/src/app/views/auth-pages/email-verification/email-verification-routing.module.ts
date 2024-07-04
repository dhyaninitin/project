import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmailVerificationComponent } from './email-verification.component';


const routes: Routes = [
  {path: "", component:EmailVerificationComponent, data: {title: 'Email Verification'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailVerificationRoutingModule { }
