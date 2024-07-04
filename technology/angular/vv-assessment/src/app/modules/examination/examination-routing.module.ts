import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestDescriptionComponent } from './components/test-description/test-description.component';
import { TestQuestionsComponent } from './components/test-questions/test-questions.component';
import { TestCompleteComponent } from './components/test-complete/test-complete.component';

const routes: Routes = [
  { path: "", redirectTo: "test-description", pathMatch: 'full' },
  { path: "test-description", component: TestDescriptionComponent },
  { path: "test-questions", component: TestQuestionsComponent },
  { path: "test-complete", component: TestCompleteComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExaminationRoutingModule { }
