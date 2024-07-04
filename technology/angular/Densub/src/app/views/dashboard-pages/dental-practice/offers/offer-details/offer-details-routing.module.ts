import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OfferDetailsComponent } from './offer-details.component';


const routes: Routes = [
  {path: '', component: OfferDetailsComponent, data: {title: 'Profile'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferDetailsRoutingModule { }
