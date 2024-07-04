import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovalsComponent } from './components/approvals/approvals.component';
import { GeneralInfoComponent } from './components/general-info/general-info.component';
import { OfferSendOutComponent } from './components/offer-send-out/offer-send-out.component';
import { SalaryStructureComponent } from './components/salary-structure/salary-structure.component';
import { CandidateComponent } from '../candidate/candidate.component';
import { CandidateInfoComponent } from './components/candidate-info/candidate-info.component';
import { OfferComponent } from './offer.component';

const routes: Routes = [
  {
    path:"", component:OfferComponent
  },
  {
    path:"generalinfo",component:GeneralInfoComponent
  },
  {
    path:"salary-structure",component:SalaryStructureComponent
  },
  {
    path:"approval",component:ApprovalsComponent
  },
  {
    path:"offer-send-out",component:OfferSendOutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferRoutingModule { }
