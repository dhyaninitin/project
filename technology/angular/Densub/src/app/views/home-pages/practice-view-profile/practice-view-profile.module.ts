import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { OwlModule } from 'ngx-owl-carousel';
import { PracticeViewProfileComponent } from './practice-view-profile.component';
import { PracticeViewProfileRoutingModule } from './practice-view-profile-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PracticeJobFilterPipe } from '../../dashboard-pages/dental-practice/jobs/job-posts/practice-job-filter.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    OwlModule,
    SharedUiModule,
    PracticeViewProfileRoutingModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    TabsModule.forRoot()
  ],
  declarations: [PracticeViewProfileComponent,PracticeJobFilterPipe],
  providers: []
})
export class PracticeViewProfileModule { }
