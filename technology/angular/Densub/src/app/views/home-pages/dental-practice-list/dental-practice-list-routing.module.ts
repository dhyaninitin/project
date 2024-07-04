import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DentalPracticeListComponent } from './dental-practice-list.component';


const routes: Routes = [
   { path: '', component: DentalPracticeListComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DentalPracticeListRoutingModule { }
