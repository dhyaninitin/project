import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplateListRoutingModule } from './template-list-routing.module';
import { TemplateListComponent } from './template-list.component';
import { ModalModule } from 'ngx-bootstrap';


@NgModule({
  declarations: [ TemplateListComponent ],
  imports: [
    CommonModule,
    TemplateListRoutingModule,
    ModalModule.forRoot(),
  ]
})
export class TemplateListModule { }
