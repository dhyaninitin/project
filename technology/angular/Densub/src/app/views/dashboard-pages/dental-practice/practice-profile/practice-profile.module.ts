import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule } from '@angular/forms';
import { ModalModule, BsDatepickerModule } from 'ngx-bootstrap';
import { PracticeProfileComponent } from './practice-profile.component';
import { PracticeProfileRoutingModule } from './practice-profile-routing.module';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { NgxEditorModule } from 'ngx-editor';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgxImageCompressService } from 'ngx-image-compress';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgWizardConfig, NgWizardModule, THEME } from 'ng-wizard';

const ngWizardConfig: NgWizardConfig = {
  theme: THEME.default
};

@NgModule({
  imports: [
    CommonModule,
    SharedUiModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxEditorModule,
    PDFExportModule,
    PracticeProfileRoutingModule,
    NgxBootstrapSliderModule,
    BsDatepickerModule.forRoot(),
    DpDatePickerModule,
    CKEditorModule,
    NgMultiSelectDropDownModule,
    NgWizardModule.forRoot(ngWizardConfig),
    UiSwitchModule.forRoot({})
  ],
  declarations: [PracticeProfileComponent],
  providers: [NgxImageCompressService]
})
export class PracticeProfileModule { }
