import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyAssignmentRoutingModule } from './my-assignment-routing.module';
import { AssignmentDetailsComponent } from './assignment-details/assignment-details.component';
import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { ModalModule, TimepickerModule } from 'ngx-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [AssignmentDetailsComponent, AssignmentListComponent],
  imports: [
    CommonModule,
    SharedUiModule,
    NgxEditorModule,
    MyAssignmentRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    TimepickerModule.forRoot(),
    OrderModule,
    NgxPaginationModule,
    DpDatePickerModule,
    NgxMaterialTimepickerModule,
    CKEditorModule,
    NgbModule
  ]
})
export class MyAssignmentModule { }
