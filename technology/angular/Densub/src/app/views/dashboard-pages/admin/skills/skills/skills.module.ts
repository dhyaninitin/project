import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { FormsModule} from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { SkillsRoutingModule } from './skills-routing.module';
import { SkillsComponent } from './skills.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    SkillsRoutingModule,
    OrderModule,
  ],
  declarations: [SkillsComponent],
  providers: []
})
export class SkillsModule { }
