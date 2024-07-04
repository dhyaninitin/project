import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, BsDatepickerModule } from 'ngx-bootstrap';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { NgxEditorModule } from 'ngx-editor';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgxImageCompressService } from 'ngx-image-compress';
import { StaffFavouriteComponent } from './staff-favourite.component';
import { StaffFavouriteRoutingModule } from './staff-favourite-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxEditorModule,
    PDFExportModule,
    StaffFavouriteRoutingModule,
    NgxBootstrapSliderModule,
    BsDatepickerModule.forRoot(),
    DpDatePickerModule,
    NgxPaginationModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  declarations: [StaffFavouriteComponent],
  providers: [NgxImageCompressService]
})
export class StaffFavouriteModule { }
