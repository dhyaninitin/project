import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { DentalStaffListRoutingModule } from './dental-staff-list-routing.module';
import { DentalStaffListComponent } from './dental-staff-list.component';
import { DpDatePickerModule } from 'ng2-date-picker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    DentalStaffListRoutingModule,
    CarouselModule.forRoot(),
    DpDatePickerModule
  ],
  declarations: [DentalStaffListComponent],
  providers: []
})
export class DentalStaffListModule { }
