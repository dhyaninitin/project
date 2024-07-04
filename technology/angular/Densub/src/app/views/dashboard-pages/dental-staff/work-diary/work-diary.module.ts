import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { WorkDiaryRoutingModule } from './work-diary-routing.module';
import { WorkDiaryComponent } from './work-diary.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    WorkDiaryRoutingModule
  ],
  declarations: [WorkDiaryComponent],
  providers: []
})
export class WorkDiaryModule { }
