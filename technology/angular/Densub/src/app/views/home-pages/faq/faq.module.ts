import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { AccordionModule, AccordionConfig } from 'ngx-bootstrap/accordion';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { FaqComponent } from './faq.component';
import { FaqRoutingModule } from './faq-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    FaqRoutingModule,
    CarouselModule.forRoot(),
    AccordionModule.forRoot()
  ],
  declarations: [FaqComponent],
  providers: [ { provide: AccordionConfig, useValue: { closeOthers: true } },]
})
export class FaqModule {
  
 }
