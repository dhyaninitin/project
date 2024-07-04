import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractListComponent } from './contract-list/contract-list.component';
import { ContractDetailsComponent } from './contract-details/contract-details.component';


const routes: Routes = [
  {path: '', component: ContractListComponent, data: { title: 'Contract List' } },
  {path: 'details/:contractId', component: ContractDetailsComponent, data: { title: 'Contract Details' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllContractsRoutingModule { }
