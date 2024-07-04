import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { AccordionModule, AccordionConfig } from 'ngx-bootstrap/accordion';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { AboutUsRoutingModule } from './about-us-routing.module';
import { AboutUsComponent } from './about-us.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    AboutUsRoutingModule,
    CarouselModule.forRoot(),
    AccordionModule.forRoot()
  ],
  declarations: [AboutUsComponent],
  providers: [ { provide: AccordionConfig, useValue: { closeOthers: true } },]
})
export class AboutUsModule { }
