import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { TestResultComponent } from './components/test-result/test-result.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { UpdateCandidateComponent } from './components/update-candidate/update-candidate.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { QuestionsComponent } from './components/questions/questions.component';
import { UpdateQuestionComponent } from './components/update-question/update-question.component';
import { TopCandidatesComponent } from './components/top-candidates/top-candidates.component';


@NgModule({
  declarations: [
    TestResultComponent,
    UpdateCandidateComponent,
    QuestionsComponent,
    UpdateQuestionComponent,
    TopCandidatesComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MaterialModule,
    NgxFileDropModule
  ]
})
export class DashboardModule { }
