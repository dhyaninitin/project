import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OfferSentComponent } from './offer-sent.component';


const routes: Routes = [
  {path: '', component: OfferSentComponent, data: {title: 'Profile'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferSentRoutingModule { }
