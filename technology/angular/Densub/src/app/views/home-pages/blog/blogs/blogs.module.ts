import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { BlogsRoutingModule } from './blogs-routing.module';
import { BlogsComponent } from './blogs.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { TruncateModule } from 'ng2-truncate';


@NgModule({
  declarations: [BlogsComponent],
  imports: [
    CommonModule,
    BlogsRoutingModule,
    NgxPaginationModule,
    SharedUiModule,
    TruncateModule
  ]
})
export class BlogsModule { }
