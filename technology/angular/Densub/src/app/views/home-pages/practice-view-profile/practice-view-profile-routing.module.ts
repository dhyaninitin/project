import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PracticeViewProfileComponent } from './practice-view-profile.component';


const routes: Routes = [
  { path: '', component: PracticeViewProfileComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PracticeViewProfileRoutingModule { }
