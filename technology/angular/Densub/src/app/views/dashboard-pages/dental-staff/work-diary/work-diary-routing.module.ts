import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkDiaryComponent } from './work-diary.component';


const routes: Routes = [
  { path: "", component: WorkDiaryComponent, data: { title: 'Work Diary' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkDiaryRoutingModule { }
