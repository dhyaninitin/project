import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffFavouriteComponent } from './staff-favourite.component';


const routes: Routes = [
  {path: '', component: StaffFavouriteComponent, data: {title: 'Offer Sent'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffFavouriteRoutingModule { }
