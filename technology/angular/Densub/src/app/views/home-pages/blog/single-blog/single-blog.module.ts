import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SingleBlogRoutingModule } from './single-blog-routing.module';
import { SingleBlogComponent } from './single-blog.component';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { FormsModule } from '@angular/forms';
import { TruncateModule } from 'ng2-truncate';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [ SingleBlogComponent ],
  imports: [
    CommonModule,
    SingleBlogRoutingModule,
    SharedUiModule,
    FormsModule,
    TruncateModule,
    ModalModule.forRoot()
  ]
})
export class SingleBlogModule {}
