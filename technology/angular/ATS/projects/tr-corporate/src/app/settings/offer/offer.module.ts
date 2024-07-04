import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OfferRoutingModule } from './offer-routing.module';
import { TemplateComponent } from './template/template.component';
import { GenericSettingsComponent } from './generic-settings/generic-settings.component';
import { CardModule, LayoutModule, MaterialModule, McModule } from '@tr';
import {
  PerfectScrollbarModule,
  PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG,
} from 'ngx-perfect-scrollbar';
import { McCoreModule } from '@cloudtalentrecruit/ng-core';
import { TFilterComponent } from './TFilterComponent/t-filter.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true,
};
import { TemplatesModule } from '../templates/templates.module';

import { StoreModule } from '@ngrx/store';
import { offerReducer } from './store/reducers/offer.reducers';
import { AddNewTemplateComponent } from './add-new-template/add-new-template.component';
import { TemplateDetailComponent } from './template-detail/template-detail.component';
import { AssociateUserComponent } from './associate-user/associate-user.component';
import { OfferLibraryComponent } from './offer-library/offer-library.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { LibraryUploadComponent } from './library-upload/library-upload.component';
import { CreateOfferFinalComponent } from './create-offer-final/create-offer-final.component';
import { CreateOfferFirstComponent } from './create-offer-first/create-offer-first.component';
import { CreateOfferSecondComponent } from './create-offer-second/create-offer-second.component';
import { ActivityComponent } from './activity/activity.component';
import { EditOfferComponent } from './edit-offer/edit-offer.component';
import { VerifyOfferComponent } from './verify-offer/verify-offer.component';
import { StepperComponent } from './stepper/stepper.component';
import { AddComponentComponent } from './add-component/add-component.component';
import { OfferComponent } from './offer.component';
import { ViewLibraryComponent } from './view-library/view-library.component';
import { LibraryTemplateComponent } from './library-template/library-template.component';
import { templateComponentReducer } from './store/reducers/template.reducers';
import { AddCustomComponent } from './add-custom/add-custom.component';
import { ConfigDropdownComponent } from './config-dropdown/config-dropdown.component';
import { ConfigTextboxComponent } from './config-textbox/config-textbox.component';
import { DeletePopupComponent } from './delete-popup/delete-popup.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
  declarations: [
    TemplateComponent,
    GenericSettingsComponent,
    AddNewTemplateComponent,
    TemplateDetailComponent,
    TFilterComponent,
    AssociateUserComponent,
    OfferLibraryComponent,
    LibraryUploadComponent,
    CreateOfferFinalComponent,
    CreateOfferFirstComponent,
    CreateOfferSecondComponent,
    ActivityComponent,
    EditOfferComponent,
    VerifyOfferComponent,
    StepperComponent,
    AddComponentComponent,
    OfferComponent,
    ViewLibraryComponent,
    LibraryTemplateComponent,
    AddCustomComponent,
    ConfigDropdownComponent,
    ConfigTextboxComponent,
    DeletePopupComponent,
  ],
  imports: [
    CommonModule,
    McCoreModule,
    FormsModule,
    McModule,
    ReactiveFormsModule,
    NgxFileDropModule,
    MaterialModule,
    LayoutModule,
    CardModule,
    OfferRoutingModule,
    PerfectScrollbarModule,
    TemplatesModule,
    StoreModule.forFeature('create', offerReducer),
    StoreModule.forFeature('offerComponent', templateComponentReducer),
    StoreModule,
    PdfViewerModule,
    DragDropModule,
    MonacoEditorModule.forRoot(),
    NgxDocViewerModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
  exports: [ VerifyOfferComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OfferModule {}
