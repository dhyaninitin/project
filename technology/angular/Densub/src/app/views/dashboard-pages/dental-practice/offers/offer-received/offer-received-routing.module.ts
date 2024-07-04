import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OfferReceivedComponent } from './offer-received.component';


const routes: Routes = [
  {path: '', component: OfferReceivedComponent, data: {title: 'Profile'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferReceivedRoutingModule { }
