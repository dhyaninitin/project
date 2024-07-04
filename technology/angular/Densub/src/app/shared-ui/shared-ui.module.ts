import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedUiRoutingModule } from './shared-ui-routing.module';
import { LoadingComponent } from './loading/loading.component';
import { AlertComponent } from './alert';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
// import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ModalModule, BsDropdownModule, BsDatepickerModule, TimepickerModule, AccordionConfig} from 'ngx-bootstrap';
import { OwlModule } from 'ngx-owl-carousel';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { AgmCoreModule } from '@agm/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { CharacterOnlyDirective } from './directive/onlycharacter.directive';
import { NumberOnlyDirective } from './directive/onlynumber.directive';
import { SpecialNumOnlyDirective } from './directive/onlyspecialNum.directive';
import { GrdFilterPipe } from './pipe/grd-filter.pipe';
import { StaffListComponent } from './staff-list/staff-list.component';
import { DpDatePickerModule } from 'ng2-date-picker';
import { JobListComponent } from './job-list/job-list.component';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { AddEditPostComponent } from './add-edit-post/add-edit-post.component';
import { DateAgoPipe } from './pipe/date-ago.pipe';
import { JobPostsRoutingModule } from '../views/dashboard-pages/dental-practice/jobs/job-posts/job-posts-routing.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxEditorModule } from 'ngx-editor';
import { NgbModalModule, NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPayPalModule } from 'ngx-paypal';
import { JobDetailsComponent } from '../views/home-pages/job-details/job-details.component';
import { StripeModule } from 'stripe-angular';
import { CookieService } from 'ngx-cookie-service';
import { NatualNumbersOnlyDirective } from './directive/naturalNum.directive';
import { CKEditorModule } from 'ng2-ckeditor';
import { TitleCasePipe } from './pipe/titleCase.pipe';
import { AlertConfirmComponent } from './component/alert-confirm/alert-confirm.component';
import { ViewImageModalComponent } from './component/view-image-modal/view-image-modal.component';
import { FormDirective } from './directive/focusInvalidInput.directive';
import { CharNumOnlyDirective } from './directive/onlyCharNum.directive';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { Ng5SliderModule } from 'ng5-slider';
import { SearchFilterPipe } from '../views/home-pages/job-details/search-filter.pipe';
import { NgxCopyToClipboardModule } from 'ngx-copy-to-clipboard';
import { StaffPreviewComponent } from './staff-preview/staff-preview.component';
import { NgxCarouselModule } from 'ngx-carousel';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

export function getAccordionConfig(): AccordionConfig {
  return Object.assign(new AccordionConfig(), { closeOthers: true });
}

const SHARED_COMPONENTS = [
  AlertConfirmComponent,
  ViewImageModalComponent,
  LoadingComponent,
  AlertComponent,
  FormDirective,
  CharacterOnlyDirective,
  NumberOnlyDirective,
  NatualNumbersOnlyDirective,
  CharNumOnlyDirective,
  SpecialNumOnlyDirective,
  GrdFilterPipe,
  StaffListComponent,
  JobListComponent,
  AddEditPostComponent,
  DateAgoPipe,
  TitleCasePipe,
  SearchFilterPipe,
  JobDetailsComponent,
  StaffPreviewComponent
];

@NgModule({
  imports: [
    RouterModule,
    SharedUiRoutingModule,
    CommonModule,
    NgxEditorModule,
    PDFExportModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    // NgxDaterangepickerMd.forRoot(),
    ReactiveFormsModule,
    OrderModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    ToastrModule.forRoot({
      closeButton: true,
      positionClass: 'toast-bottom-right',
      maxOpened: 1,
      timeOut: 3000,
    }),
    DpDatePickerModule,
    NgxPaginationModule,
    OrderModule,
    NgxBootstrapSliderModule,
    OwlModule,
    NgxSpinnerModule,
    BsDropdownModule.forRoot(),
    PDFExportModule,
    NgbModalModule,
    NgbModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAgc3t5u6E0Q9NvRmRfOKJJUmP3PoyjN2M',
      libraries: ['places']
    }),
    NgxPayPalModule,
    StripeModule.forRoot('pk_test_sUI2ugjB83xUQ9eh5U25Y9P800zuQUHzUh'),
    CKEditorModule,
    AccordionModule,
    Ng5SliderModule,
    NgxCopyToClipboardModule,
    NgxCarouselModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  providers: [NgbActiveModal, CookieService, { provide: AccordionConfig, useFactory: getAccordionConfig }], 
  declarations: SHARED_COMPONENTS,
  exports: SHARED_COMPONENTS,
  entryComponents: [AddEditPostComponent, AlertConfirmComponent, ViewImageModalComponent]
})
export class SharedUiModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedUiModule,
      providers: []
    };
  }
}
