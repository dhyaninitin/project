import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    HomeRoutingModule,
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
  ],
  declarations: [HomeComponent],
  providers: []
})
export class HomeModule {
}
