import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CertificatesComponent } from './certificates.component';


const routes: Routes = [
  { path: '', component: CertificatesComponent, data: { title: 'Certificate' }, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificatesRoutingModule { }
