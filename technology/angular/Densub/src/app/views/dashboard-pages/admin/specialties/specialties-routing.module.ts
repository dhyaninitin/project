import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpecialtiesComponent } from './specialties.component';


const routes: Routes = [
  { path: '', component: SpecialtiesComponent, data: {title: 'Specialties'} , pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialtiesRoutingModule { }
