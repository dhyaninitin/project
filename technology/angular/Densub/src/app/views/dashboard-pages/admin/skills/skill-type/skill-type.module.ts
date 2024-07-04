import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkillTypeRoutingModule } from './skill-type-routing.module';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { SkillTypeComponent } from './skill-type.component';


@NgModule({
  declarations: [SkillTypeComponent],
  imports: [
    CommonModule,
    SkillTypeRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule
  ]
})
export class SkillTypeModule { }
