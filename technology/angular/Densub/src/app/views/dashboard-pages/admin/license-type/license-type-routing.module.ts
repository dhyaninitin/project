import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LicenseTypeComponent } from './license-type.component';

const routes: Routes = [
  { path: '', component: LicenseTypeComponent, data: {title: 'License Type'} , pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LicenseTypeRoutingModule { }
