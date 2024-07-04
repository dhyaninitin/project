import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'app/shared/services/auth.guard';
import { SharedModule } from 'app/shared/shared.module';
import { BrandComponent } from './brand/brand.component';
import { ColorComponent } from './color/color.component';
import { CreditComponent } from './credit/credit.component';
import { ModelComponent } from './model/model.component';
import { OptionsComponent } from './options/options.component';
import { ReviewComponent } from './review/review.component';
import { TrimComponent } from './trim/trim.component';

import { CreateRequestService } from 'app/shared/services/create-request.service';
import { SearchResultService } from 'app/shared/services/search-result.service';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'brand', pathMatch: 'full' },
      { path: 'brand', component: BrandComponent },
      { path: 'model', component: ModelComponent },
      { path: 'trim', component: TrimComponent },
      { path: 'colors', component: ColorComponent },
      { path: 'options', component: OptionsComponent },
      { path: 'search', component: SearchComponent },
      {
        path: 'review',
        component: ReviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'credit-assessment',
        component: CreditComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
  declarations: [
    BrandComponent,
    ModelComponent,
    TrimComponent,
    ColorComponent,
    ReviewComponent,
    OptionsComponent,
    ReviewComponent,
    CreditComponent,
    SearchComponent,
  ],
  exports: [RouterModule],
  providers: [SearchResultService, CreateRequestService],
})
export class FindMyCarModule {}
