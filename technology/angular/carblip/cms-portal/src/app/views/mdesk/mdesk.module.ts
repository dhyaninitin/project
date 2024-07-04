import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MdeskComponent } from './mdesk.component';
import { MDeskRoutes } from './mdesk.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MDeskRoutes)
  ],
  declarations: [
    MdeskComponent,
  ]
})
export class MDeskModule {}
