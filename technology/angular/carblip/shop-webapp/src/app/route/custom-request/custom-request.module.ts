import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { CustomRequestCreditComponent } from './credit/credit.component';
import { CustomRequestSearchComponent } from './search/search.component';

import { CreateRequestService } from 'app/shared/services/create-request.service';
import { SearchResultService } from 'app/shared/services/search-result.service';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'select', pathMatch: 'full' },
      { path: 'select', component: CustomRequestSearchComponent },
      { path: 'credit', component: CustomRequestCreditComponent },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
  declarations: [CustomRequestSearchComponent, CustomRequestCreditComponent],
  exports: [RouterModule],
  providers: [SearchResultService, CreateRequestService],
})
export class CustomRequestModule {}
