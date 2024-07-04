import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestResultComponent } from './components/test-result/test-result.component';
import { QuestionsComponent } from './components/questions/questions.component';

const routes: Routes = [
  { path: '', component: TestResultComponent },
  { path: 'questions', component: QuestionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
