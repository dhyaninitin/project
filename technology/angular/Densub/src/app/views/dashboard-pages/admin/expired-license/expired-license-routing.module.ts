import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpiredLicenseComponent } from './expired-license.component';


const routes: Routes = [
  {path: '', component: ExpiredLicenseComponent, data: {title: 'Expired License'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpiredLicenseRoutingModule { }
