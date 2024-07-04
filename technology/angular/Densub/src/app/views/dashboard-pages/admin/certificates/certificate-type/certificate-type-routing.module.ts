import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CertificateTypeComponent } from './certificate-type.component';


const routes: Routes = [
  { path: '', component: CertificateTypeComponent , data: { title: 'Certificate Type' }, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificateTypeRoutingModule { }
