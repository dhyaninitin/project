import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { DentalPracticeListComponent } from './dental-practice-list.component';
import { DentalPracticeListRoutingModule } from './dental-practice-list-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    DentalPracticeListRoutingModule,
    CarouselModule.forRoot(),
  ],
  declarations: [DentalPracticeListComponent],
  providers: []
})
export class DentalPracticeListModule { }
