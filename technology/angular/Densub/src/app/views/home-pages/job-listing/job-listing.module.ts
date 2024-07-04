import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { AccordionModule, AccordionConfig } from 'ngx-bootstrap/accordion';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { JobListingRoutingModule } from './job-listing-routing.module';
import { JobListingComponent } from './job-listing.component';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
// import { DpDatePickerModule } from 'ng2-date-picker';
// import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    JobListingRoutingModule,
    CarouselModule.forRoot(),
    AccordionModule.forRoot(),
    // NgxDaterangepickerMd.forRoot(),
    NgxBootstrapSliderModule,
    // DpDatePickerModule,
  ],
  declarations: [JobListingComponent],
  providers: [ { provide: AccordionConfig, useValue: { closeOthers: true } }]
})
export class JobListingModule { }
