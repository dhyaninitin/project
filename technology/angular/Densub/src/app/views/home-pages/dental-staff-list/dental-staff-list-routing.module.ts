import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DentalStaffListComponent } from './dental-staff-list.component';


const routes: Routes = [
   { path: '', component: DentalStaffListComponent, pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DentalStaffListRoutingModule { }
