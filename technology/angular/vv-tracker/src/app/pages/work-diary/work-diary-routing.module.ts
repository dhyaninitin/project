import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkDiaryComponent } from './work-diary.component';

const routes: Routes = [
  { path: '', component: WorkDiaryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkDiaryRoutingModule { }
