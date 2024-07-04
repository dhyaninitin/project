import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdvertisementComponent } from './advertisement.component';


const routes: Routes = [
  {path: '', component: AdvertisementComponent, data: {title: 'Advertisement'}, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvertisementRoutingModule { }
