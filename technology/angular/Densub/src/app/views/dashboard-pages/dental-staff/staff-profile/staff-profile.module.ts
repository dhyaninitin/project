import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, TimepickerModule } from 'ngx-bootstrap';
import { StaffProfileComponent } from './staff-profile.component';
import { StaffProfileRoutingModule } from './staff-profile-routing.module';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { NgxEditorModule } from 'ngx-editor';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CalendarDateFormatter, CalendarModule, CalendarMomentDateFormatter, DateAdapter, MOMENT } from 'angular-calendar';
//import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgxImageCompressService } from 'ngx-image-compress';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { CKEditorModule } from 'ng2-ckeditor';
import { Ng5SliderModule } from 'ng5-slider';
import { NgWizardModule, NgWizardConfig, THEME } from 'ng-wizard';
import { UiSwitchModule } from 'ngx-ui-switch';
import { HttpClientModule } from '@angular/common/http';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';
export function momentAdapterFactory() {
  return adapterFactory(moment);
}
const ngWizardConfig: NgWizardConfig = {
  theme: THEME.default
};

@NgModule({
  imports: [
    CommonModule,
    SharedUiModule,
    NgxEditorModule,
    PDFExportModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    // ReactiveFormsModule,
    // SharedUiModule,
    ModalModule.forRoot(),
    StaffProfileRoutingModule,
    NgxBootstrapSliderModule,
    BsDatepickerModule.forRoot(),
    //TimepickerModule.forRoot(),
    DpDatePickerModule,
    CalendarModule.forRoot(
      {
        provide: DateAdapter,
        useFactory: momentAdapterFactory,
      },
      {
        dateFormatter: {
          provide: CalendarDateFormatter,
          useClass: CalendarMomentDateFormatter,
        },
      }
    ),
    NgxMaterialTimepickerModule,
    CKEditorModule,
    Ng5SliderModule,
    NgWizardModule.forRoot(ngWizardConfig),
    UiSwitchModule,
    HttpClientModule
  ],
  declarations: [StaffProfileComponent],
  providers: [NgxImageCompressService, {
    provide: MOMENT,
    useValue: moment,
  }]
})
export class StaffProfileModule { }
