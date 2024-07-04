import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExaminationRoutingModule } from './examination-routing.module';
import { TestDescriptionComponent } from './components/test-description/test-description.component';
import { TestQuestionsComponent } from './components/test-questions/test-questions.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { TestCompleteComponent } from './components/test-complete/test-complete.component';
import { TestStartConfirmationComponent } from './components/test-start-confirmation/test-start-confirmation.component';


@NgModule({
  declarations: [
    TestDescriptionComponent,
    TestQuestionsComponent,
    TestCompleteComponent,
    TestStartConfirmationComponent
  ],
  imports: [
    CommonModule,
    ExaminationRoutingModule,
    MaterialModule
  ]
})
export class ExaminationModule { }
