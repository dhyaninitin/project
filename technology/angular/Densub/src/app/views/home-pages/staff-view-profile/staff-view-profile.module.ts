import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { StaffViewProfileRoutingModule } from './staff-view-profile-routing.module';
import { StaffViewProfileComponent } from './staff-view-profile.component';
import { ModalModule } from 'ngx-bootstrap';
import { OwlModule } from 'ngx-owl-carousel';
import { DateAdapter, CalendarModule } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    StaffViewProfileRoutingModule,
    OwlModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  declarations: [StaffViewProfileComponent],
  providers: []
})
export class StaffViewProfileModule { }
